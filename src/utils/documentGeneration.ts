import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import type { MeetingInfo } from '../types/meeting';
import type { FormattedMinutes } from '../types/minutes';

export class MeetingMinutesGenerator {
  createMeetingMinutesDocument(meetingInfo: MeetingInfo, formattedMinutes: FormattedMinutes): Document {
    const doc = new Document({
      creator: 'Lobethal Harmony Club Minutes System',
      title: 'Meeting Minutes',
      description: 'Lobethal Harmony Club Meeting Minutes',
      sections: [{
        properties: {},
        children: [
          // Header with Club Logo and Title
          new Paragraph({
            text: 'LOBETHAL HARMONY CLUB',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          }),

          new Paragraph({
            text: `${meetingInfo.type.toUpperCase()} MINUTES`,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),

          // Meeting Details Table
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
              insideVertical: { style: BorderStyle.SINGLE, size: 1 }
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Date:', bold: true })] })],
                    width: { size: 20, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [new Paragraph(meetingInfo.date.toLocaleDateString('en-AU'))],
                    width: { size: 30, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Meeting Type:', bold: true })] })],
                    width: { size: 20, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [new Paragraph(meetingInfo.type)],
                    width: { size: 30, type: WidthType.PERCENTAGE }
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Chairperson:', bold: true })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph(meetingInfo.chairperson)]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Minutes By:', bold: true })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph(meetingInfo.minutesBy)]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Present:', bold: true })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph(meetingInfo.present)],
                    columnSpan: 3
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Apologies:', bold: true })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph(meetingInfo.apologies)],
                    columnSpan: 3
                  })
                ]
              })
            ]
          }),

          new Paragraph({
            text: '',
            spacing: { after: 400 }
          }),

          // Meeting Content Section
          new Paragraph({
            text: 'MEETING CONTENT',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 }
          }),

          // Dynamic content from formatted minutes
          ...(formattedMinutes.htmlContent ? this.parseHTMLToDocxParagraphs(formattedMinutes.htmlContent) : [
            new Paragraph({
              text: 'No formatted meeting content available.',
              spacing: { after: 200 }
            })
          ]),

          // Action Items Section
          ...(formattedMinutes.actionItems && formattedMinutes.actionItems.length > 0 ? [
            new Paragraph({
              text: 'ACTION ITEMS',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            ...formattedMinutes.actionItems.map((item, index) => 
              new Paragraph({
                children: [
                  new TextRun({ text: `${index + 1}. `, bold: true }),
                  new TextRun(item.description),
                  ...(item.assignee ? [
                    new TextRun({ text: ' (Assigned to: ', italics: true }),
                    new TextRun({ text: item.assignee, bold: true }),
                    new TextRun({ text: ')', italics: true })
                  ] : [])
                ],
                spacing: { after: 100 }
              })
            )
          ] : []),

          // Decisions Section
          ...(formattedMinutes.decisions && formattedMinutes.decisions.length > 0 ? [
            new Paragraph({
              text: 'DECISIONS MADE',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            ...formattedMinutes.decisions.map((decision, index) => 
              new Paragraph({
                children: [
                  new TextRun({ text: `${index + 1}. `, bold: true }),
                  new TextRun(decision)
                ],
                spacing: { after: 100 }
              })
            )
          ] : []),

          // Next Meeting Section
          ...(formattedMinutes.nextMeeting ? [
            new Paragraph({
              text: 'NEXT MEETING',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            new Paragraph({
              text: formattedMinutes.nextMeeting,
              spacing: { after: 200 }
            })
          ] : []),

          // Footer with closing information
          new Paragraph({
            text: 'Meeting closed at: _______________',
            spacing: { before: 400, after: 200 }
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Chairperson: ', bold: true }),
              new TextRun('________________________  Date: ____________')
            ],
            spacing: { after: 100 }
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Secretary: ', bold: true }),
              new TextRun('________________________  Date: ____________')
            ],
            spacing: { after: 200 }
          })
        ]
      }]
    });

    return doc;
  }

  private parseHTMLToDocxParagraphs(htmlContent: string): Paragraph[] {
    // Simple HTML to docx paragraph conversion
    // This handles the HTML format from our OpenAI output
    const paragraphs: Paragraph[] = [];
    
    // Remove HTML tags and split into items
    const cleanContent = htmlContent.replace(/<[^>]*>/g, '');
    const items = cleanContent.split(/\d+\./).filter(item => item.trim());
    
    items.forEach((item, index) => {
      if (item.trim()) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${index + 1}. `, bold: true }),
              new TextRun(item.trim())
            ],
            spacing: { after: 200 }
          })
        );
      }
    });

    return paragraphs.length > 0 ? paragraphs : [
      new Paragraph({
        text: 'Meeting content will appear here after generating minutes.',
        spacing: { after: 200 }
      })
    ];
  }

  async generateAndDownloadDocument(
    meetingInfo: MeetingInfo, 
    formattedMinutes: FormattedMinutes, 
    filename?: string
  ): Promise<void> {
    try {
      const doc = this.createMeetingMinutesDocument(meetingInfo, formattedMinutes);
      const blob = await Packer.toBlob(doc);
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const meetingType = meetingInfo.type.toLowerCase().replace(/\s+/g, '-');
      const date = meetingInfo.date.toISOString().split('T')[0];
      
      link.download = filename || `lhc-${meetingType}-minutes-${date}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating Word document:', error);
      throw new Error('Failed to generate Word document');
    }
  }
}