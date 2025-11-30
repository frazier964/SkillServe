import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

function Availability() {
  const [availability, setAvailability] = useState({
    monday: { enabled: false, startTime: '09:00', endTime: '17:00' },
    tuesday: { enabled: false, startTime: '09:00', endTime: '17:00' },
    wednesday: { enabled: false, startTime: '09:00', endTime: '17:00' },
    thursday: { enabled: false, startTime: '09:00', endTime: '17:00' },
    friday: { enabled: false, startTime: '09:00', endTime: '17:00' },
    saturday: { enabled: false, startTime: '09:00', endTime: '17:00' },
    sunday: { enabled: false, startTime: '09:00', endTime: '17:00' },
  });

  const [timeZone, setTimeZone] = useState('UTC');
  const [isAvailableNow, setIsAvailableNow] = useState(false);

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  useEffect(() => {
    // Load saved availability from localStorage
    const savedAvailability = localStorage.getItem('handymanAvailability');
    if (savedAvailability) {
      setAvailability(JSON.parse(savedAvailability));
    }

    const savedTimeZone = localStorage.getItem('handymanTimeZone');
    if (savedTimeZone) {
      setTimeZone(savedTimeZone);
    }
  }, []);

  const handleDayToggle = (day) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled
      }
    }));
  };

  const handleTimeChange = (day, timeType, value) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [timeType]: value
      }
    }));
  };

  const handleSave = () => {
    localStorage.setItem('handymanAvailability', JSON.stringify(availability));
    localStorage.setItem('handymanTimeZone', timeZone);
    alert('Availability settings saved successfully!');
  };

  const handleQuickSetAll = () => {
    const newAvailability = { ...availability };
    days.forEach(day => {
      newAvailability[day.key] = {
        enabled: true,
        startTime: '09:00',
        endTime: '17:00'
      };
    });
    setAvailability(newAvailability);
  };

  const handleClearAll = () => {
    const newAvailability = { ...availability };
    days.forEach(day => {
      newAvailability[day.key] = {
        enabled: false,
        startTime: '09:00',
        endTime: '17:00'
      };
    });
    setAvailability(newAvailability);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-linear-to-r from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Availability Settings</h1>
              <p className="text-gray-600">Set your working hours and availability for clients to book your services.</p>
            </div>

            {/* Current Status */}
            <div className="mb-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isAvailableNow ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="font-semibold text-gray-700">
                  Status: {isAvailableNow ? 'Available Now' : 'Currently Unavailable'}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8 flex gap-4">
              <button
                onClick={handleQuickSetAll}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Set All Days (9 AM - 5 PM)
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear All
              </button>
            </div>

            {/* Time Zone Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
              <select
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="UTC">UTC</option>
                <option value="EST">Eastern Standard Time (EST)</option>
                <option value="CST">Central Standard Time (CST)</option>
                <option value="MST">Mountain Standard Time (MST)</option>
                <option value="PST">Pacific Standard Time (PST)</option>
              </select>
            </div>

            {/* Weekly Schedule */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Weekly Schedule</h2>
              
              {days.map((day) => (
                <div key={day.key} className="bg-white/50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={availability[day.key].enabled}
                          onChange={() => handleDayToggle(day.key)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="font-medium text-gray-700 w-24">{day.label}</span>
                      </label>
                    </div>

                    {availability[day.key].enabled && (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">From:</label>
                          <input
                            type="time"
                            value={availability[day.key].startTime}
                            onChange={(e) => handleTimeChange(day.key, 'startTime', e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">To:</label>
                          <input
                            type="time"
                            value={availability[day.key].endTime}
                            onChange={(e) => handleTimeChange(day.key, 'endTime', e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}

                    {!availability[day.key].enabled && (
                      <span className="text-gray-400 italic">Unavailable</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSave}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg"
              >
                Save Availability
              </button>
            </div>

            {/* Additional Notes */}
            <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Note:</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Your availability will be visible to clients when they book services</li>
                <li>• You can update your schedule anytime</li>
                <li>• Emergency bookings may still be possible outside set hours</li>
                <li>• Time zone changes will affect all your scheduled appointments</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Availability;