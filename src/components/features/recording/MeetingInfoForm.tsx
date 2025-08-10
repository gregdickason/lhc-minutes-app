import React, { useState } from 'react';
import type { MeetingInfo } from '../../../types/meeting';

interface MeetingInfoFormProps {
  onSubmit: (info: MeetingInfo) => void;
}

const MeetingInfoForm: React.FC<MeetingInfoFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<MeetingInfo>({
    date: new Date(),
    type: 'Meeting',
    chairperson: '',
    present: '',
    apologies: '',
    minutesBy: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'date' ? new Date(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <div>
        <label htmlFor="date" className="block text-sm font-semibold text-gray-600 mb-1">
          Meeting Date:
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date.toISOString().split('T')[0]}
          onChange={handleChange}
          className="w-full p-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-harmony-primary"
          required
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-semibold text-gray-600 mb-1">
          Meeting Type:
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full p-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-harmony-primary"
          required
        >
          <option value="Meeting">Meeting</option>
          <option value="Practice">Practice</option>
          <option value="Committee">Committee</option>
          <option value="Performance">Performance</option>
          <option value="Special">Special</option>
        </select>
      </div>

      <div>
        <label htmlFor="chairperson" className="block text-sm font-semibold text-gray-600 mb-1">
          Chair:
        </label>
        <input
          type="text"
          id="chairperson"
          name="chairperson"
          value={formData.chairperson}
          onChange={handleChange}
          placeholder="Meeting chairperson"
          className="w-full p-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-harmony-primary"
          required
        />
      </div>

      <div>
        <label htmlFor="present" className="block text-sm font-semibold text-gray-600 mb-1">
          Present:
        </label>
        <input
          type="text"
          id="present"
          name="present"
          value={formData.present}
          onChange={handleChange}
          placeholder="Number of members present"
          className="w-full p-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-harmony-primary"
          required
        />
      </div>

      <div>
        <label htmlFor="apologies" className="block text-sm font-semibold text-gray-600 mb-1">
          Apologies:
        </label>
        <input
          type="text"
          id="apologies"
          name="apologies"
          value={formData.apologies}
          onChange={handleChange}
          placeholder="Members who sent apologies"
          className="w-full p-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-harmony-primary"
        />
      </div>

      <div>
        <label htmlFor="minutesBy" className="block text-sm font-semibold text-gray-600 mb-1">
          Minutes by:
        </label>
        <input
          type="text"
          id="minutesBy"
          name="minutesBy"
          value={formData.minutesBy}
          onChange={handleChange}
          placeholder="Person taking minutes"
          className="w-full p-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-harmony-primary"
          required
        />
      </div>
    </form>
  );
};

export default MeetingInfoForm;