import jsPDF from 'jspdf';
import type { MeetingInfo } from '../types/meeting';
import type { FormattedMinutes } from '../types/minutes';

export class MeetingMinutesPDFGenerator {
  private doc: jsPDF;
  private readonly pageWidth: number;
  private readonly pageHeight: number;
  private readonly margin: number;
  private currentY: number;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.width;
    this.pageHeight = this.doc.internal.pageSize.height;
    this.margin = 20;
    this.currentY = this.margin;
  }

  public generateMeetingMinutesPDF(meetingInfo: MeetingInfo, formattedMinutes: FormattedMinutes): Blob {
    this.addHeader(meetingInfo);
    this.addMeetingDetailsTable(meetingInfo);
    this.addMeetingContent(formattedMinutes);
    this.addActionItems(formattedMinutes);
    this.addDecisions(formattedMinutes);
    this.addNextMeeting(formattedMinutes);
    this.addFooter();
    
    return this.doc.output('blob');
  }

  public downloadMeetingMinutesPDF(meetingInfo: MeetingInfo, formattedMinutes: FormattedMinutes, filename?: string): void {
    const blob = this.generateMeetingMinutesPDF(meetingInfo, formattedMinutes);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const meetingType = meetingInfo.type.toLowerCase().replace(/\s+/g, '-');
    const date = meetingInfo.date.toISOString().split('T')[0];
    
    link.download = filename || `lhc-${meetingType}-minutes-${date}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private addHeader(meetingInfo: MeetingInfo): void {
    // Lobethal Harmony Club Header
    this.doc.setFontSize(22);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('LOBETHAL HARMONY CLUB', this.pageWidth / 2, this.currentY, { align: 'center' });
    
    this.currentY += 12;
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${meetingInfo.type.toUpperCase()} MINUTES`, this.pageWidth / 2, this.currentY, { align: 'center' });
    
    this.currentY += 15;
    
    // Add line separator
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 15;
  }

  private addMeetingDetailsTable(meetingInfo: MeetingInfo): void {
    const tableData = [
      ['Date:', meetingInfo.date.toLocaleDateString('en-AU'), 'Meeting Type:', meetingInfo.type],
      ['Chairperson:', meetingInfo.chairperson, 'Minutes By:', meetingInfo.minutesBy],
      ['Present:', meetingInfo.present, '', ''],
      ['Apologies:', meetingInfo.apologies, '', '']
    ];

    let tableY = this.currentY;
    const cellHeight = 8;
    const cellWidths = [25, 40, 25, 40];
    const tableWidth = cellWidths.reduce((sum, width) => sum + width, 0);
    const startX = (this.pageWidth - tableWidth) / 2;

    // Draw table border
    this.doc.setLineWidth(0.3);
    this.doc.rect(startX, tableY - 3, tableWidth, tableData.length * cellHeight + 6);

    tableData.forEach((row, rowIndex) => {
      let cellX = startX;
      
      row.forEach((cell, cellIndex) => {
        if (cell) {
          // Bold for labels
          if (cellIndex % 2 === 0 && cell.endsWith(':')) {
            this.doc.setFont('helvetica', 'bold');
          } else {
            this.doc.setFont('helvetica', 'normal');
          }
          
          this.doc.setFontSize(10);
          
          // Handle multi-line text for Present and Apologies
          if ((cell.length > 30 && (cellIndex === 1 || cellIndex === 3)) || rowIndex >= 2) {
            const lines = this.doc.splitTextToSize(cell, cellWidths[cellIndex] - 2);
            lines.forEach((line: string, lineIndex: number) => {
              this.doc.text(line, cellX + 1, tableY + (lineIndex * 4) + 5);
            });
          } else {
            // Vertically center text in cell (cellHeight/2 + font offset)
            this.doc.text(cell, cellX + 1, tableY + (cellHeight / 2) + 2);
          }
        }
        
        // Draw vertical cell borders
        if (cellIndex < row.length - 1) {
          this.doc.line(cellX + cellWidths[cellIndex], tableY - 3, cellX + cellWidths[cellIndex], tableY + cellHeight + 3);
        }
        
        cellX += cellWidths[cellIndex];
      });
      
      // Draw horizontal cell borders
      if (rowIndex < tableData.length - 1) {
        this.doc.line(startX, tableY + cellHeight, startX + tableWidth, tableY + cellHeight);
      }
      
      tableY += cellHeight;
    });

    this.currentY = tableY + 20;
  }

  private addMeetingContent(formattedMinutes: FormattedMinutes): void {
    if (!formattedMinutes.htmlContent) return;
    
    this.addSectionTitle('MEETING CONTENT');
    
    // Parse HTML content to text
    const cleanContent = formattedMinutes.htmlContent.replace(/<[^>]*>/g, '');
    const items = cleanContent.split(/\d+\./).filter((item: string) => item.trim());
    
    items.forEach((item, index) => {
      if (item.trim()) {
        this.checkPageBreak(15);
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(`${index + 1}.`, this.margin, this.currentY);
        
        this.doc.setFont('helvetica', 'normal');
        const lines = this.doc.splitTextToSize(item.trim(), this.pageWidth - this.margin * 2 - 15);
        
        lines.forEach((line: string, lineIndex: number) => {
          if (lineIndex > 0) this.checkPageBreak(6);
          this.doc.text(line, this.margin + 15, this.currentY);
          if (lineIndex < lines.length - 1) this.currentY += 6;
        });
        
        this.currentY += 12;
      }
    });
  }

  private addActionItems(formattedMinutes: FormattedMinutes): void {
    if (!formattedMinutes.actionItems || formattedMinutes.actionItems.length === 0) return;
    
    this.addSectionTitle('ACTION ITEMS');
    
    formattedMinutes.actionItems.forEach((item, index) => {
      this.checkPageBreak(12);
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${index + 1}.`, this.margin, this.currentY);
      
      this.doc.setFont('helvetica', 'normal');
      let text = item.description;
      if (item.assignee) {
        text += ` (Assigned to: ${item.assignee})`;
      }
      
      const lines = this.doc.splitTextToSize(text, this.pageWidth - this.margin * 2 - 15);
      lines.forEach((line: string, lineIndex: number) => {
        if (lineIndex > 0) this.checkPageBreak(6);
        this.doc.text(line, this.margin + 15, this.currentY);
        if (lineIndex < lines.length - 1) this.currentY += 6;
      });
      
      this.currentY += 10;
    });
  }

  private addDecisions(formattedMinutes: FormattedMinutes): void {
    if (!formattedMinutes.decisions || formattedMinutes.decisions.length === 0) return;
    
    this.addSectionTitle('DECISIONS MADE');
    
    formattedMinutes.decisions.forEach((decision: string, index: number) => {
      this.checkPageBreak(12);
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${index + 1}.`, this.margin, this.currentY);
      
      this.doc.setFont('helvetica', 'normal');
      const lines = this.doc.splitTextToSize(decision, this.pageWidth - this.margin * 2 - 15);
      
      lines.forEach((line: string, lineIndex: number) => {
        if (lineIndex > 0) this.checkPageBreak(6);
        this.doc.text(line, this.margin + 15, this.currentY);
        if (lineIndex < lines.length - 1) this.currentY += 6;
      });
      
      this.currentY += 10;
    });
  }

  private addNextMeeting(formattedMinutes: FormattedMinutes): void {
    if (!formattedMinutes.nextMeeting) return;
    
    this.addSectionTitle('NEXT MEETING');
    this.addTextContent(formattedMinutes.nextMeeting);
  }


  private addSectionTitle(title: string): void {
    this.checkPageBreak(20);
    this.currentY += 10;
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 15;
  }

  private addTextContent(text: string): void {
    if (!text?.trim()) return;
    
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    const lines = this.doc.splitTextToSize(text, this.pageWidth - (this.margin * 2));
    
    lines.forEach((line: string) => {
      this.checkPageBreak(6);
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += 6;
    });
    this.currentY += 8;
  }

  private addFooter(): void {
    // Add footer on each page
    const totalPages = this.doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      const footerY = this.pageHeight - 20;
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'italic');
      this.doc.text(`Lobethal Harmony Club - Generated on: ${new Date().toLocaleString('en-AU')}`, 
                    this.margin, footerY);
      this.doc.text(`Page ${i} of ${totalPages}`, 
                    this.pageWidth - this.margin - 30, footerY);
    }
  }

  private checkPageBreak(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.pageHeight - 40) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }
}