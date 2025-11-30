import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';


const PASS_THRESHOLD = 60; 

const sampleStudents = [
  {
    id: 1,
    name: 'Alice Johnson',
    admissionNumber: 'STU2024001',
    photo: 'https://ui-avatars.com/api/?name=Alice+Johnson&background=6366f1&color=ffffff&size=128',
    contact: {
      phoneNumber: '+233 24 123 4567',
      alternatePhone: '+233 20 987 1234',
      email: 'alice.johnson@student.ug.edu.gh',
      emergencyContact: {
        name: 'Mary Johnson (Mother)',
        phone: '+233 26 555 8901'
      }
    },
    financial: {
      totalFeeRequired: 2500,
      amountPaid: 2500,
      balance: 0,
      lastPaymentDate: '2024-11-15',
      paymentStatus: 'Paid',
      paymentHistory: [
        { date: '2024-09-01', amount: 1250, method: 'Bank Transfer', reference: 'TXN001' },
        { date: '2024-11-15', amount: 1250, method: 'Cash', reference: 'TXN002' }
      ]
    },
    foodOrdering: {
      deliveryAddress: {
        type: 'Hostel',
        details: 'Victoria Hall, Room 302',
        phone: '+233 24 123 4567'
      },
      preferredPaymentMethod: 'M-PESA',
      orderHistory: [
        { date: '2024-11-20', items: ['Jollof Rice', 'Fried Chicken', 'Soft Drink'], total: 45, status: 'Delivered' },
        { date: '2024-11-18', items: ['Banku & Tilapia', 'Kelewele'], total: 38, status: 'Delivered' },
        { date: '2024-11-15', items: ['Waakye', 'Boiled Eggs', 'Pepper Sauce'], total: 25, status: 'Delivered' }
      ],
      savedFavorites: [
        { name: 'Jollof Rice & Chicken Combo', price: 35 },
        { name: 'Banku & Tilapia Special', price: 40 },
        { name: 'Waakye with Extras', price: 28 }
      ]
    },
    history: [
      {
        term: '2024 Fall',
        courses: [
          { name: 'Math', score: 85 },
          { name: 'English', score: 78 },
        ],
      },
      {
        term: '2025 Spring',
        courses: [
          { name: 'Math', score: 88 },
          { name: 'Science', score: 92 },
        ],
      },
    ],
  },
  {
    id: 2,
    name: 'Ben Osei',
    admissionNumber: 'STU2024002',
    photo: 'https://ui-avatars.com/api/?name=Ben+Osei&background=059669&color=ffffff&size=128',
    contact: {
      phoneNumber: '+233 20 987 6543',
      alternatePhone: null,
      email: 'ben.osei@student.ug.edu.gh',
      emergencyContact: {
        name: 'Samuel Osei (Father)',
        phone: '+233 24 777 9999'
      }
    },
    financial: {
      totalFeeRequired: 2200,
      amountPaid: 1100,
      balance: 1100,
      lastPaymentDate: '2024-10-20',
      paymentStatus: 'Partially Paid',
      paymentHistory: [
        { date: '2024-08-15', amount: 500, method: 'Mobile Money', reference: 'MM001' },
        { date: '2024-10-20', amount: 600, method: 'Bank Transfer', reference: 'TXN003' }
      ]
    },
    foodOrdering: {
      deliveryAddress: {
        type: 'Class',
        details: 'Science Block, Room 204',
        phone: '+233 20 987 6543'
      },
      preferredPaymentMethod: 'Visa',
      orderHistory: [
        { date: '2024-11-21', items: ['Pizza Margherita', 'Coca Cola'], total: 55, status: 'Delivered' },
        { date: '2024-11-19', items: ['Fried Rice', 'Grilled Chicken'], total: 42, status: 'Cancelled' }
      ],
      savedFavorites: [
        { name: 'Pizza & Drink Combo', price: 50 },
        { name: 'Fried Rice Special', price: 35 }
      ]
    },
    history: [
      {
        term: '2024 Fall',
        courses: [
          { name: 'Math', score: 48 },
          { name: 'English', score: 55 },
        ],
      },
    ],
  },
  {
    id: 3,
    name: 'Chioma N.',
    admissionNumber: 'STU2024003',
    photo: 'https://ui-avatars.com/api/?name=Chioma+N&background=dc2626&color=ffffff&size=128',
    contact: {
      phoneNumber: '+233 26 555 7890',
      alternatePhone: '+233 50 123 4567',
      email: 'chioma.n@student.ug.edu.gh',
      emergencyContact: {
        name: 'Grace Nkomo (Aunt)',
        phone: '+233 24 888 3333'
      }
    },
    financial: {
      totalFeeRequired: 1800,
      amountPaid: 0,
      balance: 1800,
      lastPaymentDate: null,
      paymentStatus: 'Not Paid',
      paymentHistory: []
    },
    foodOrdering: {
      deliveryAddress: {
        type: 'Home',
        details: '123 Adenta Housing, Accra',
        phone: '+233 26 555 7890'
      },
      preferredPaymentMethod: 'Mastercard',
      orderHistory: [
        { date: '2024-11-22', items: ['Fufu & Light Soup', 'Meat'], total: 30, status: 'Pending' },
        { date: '2024-11-20', items: ['Red Red', 'Plantain', 'Fish'], total: 22, status: 'Delivered' },
        { date: '2024-11-17', items: ['Kenkey', 'Pepper & Fish'], total: 18, status: 'Delivered' }
      ],
      savedFavorites: [
        { name: 'Fufu & Soup Combo', price: 32 },
        { name: 'Red Red Special', price: 25 },
        { name: 'Kenkey & Fish', price: 20 }
      ]
    },
    history: [
      {
        term: '2025 Spring',
        courses: [
          { name: 'Art', score: 95 },
          { name: 'History', score: 90 },
        ],
      },
    ],
  },
];


function averageOfCourses(courses) {
  if (!courses || courses.length === 0) return null;
  const total = courses.reduce((s, c) => s + (Number(c.score) || 0), 0);
  return total / courses.length;
}


function latestAverage(student) {
  if (!student || !student.history || student.history.length === 0) return null;
  const latest = student.history[student.history.length - 1];
  return averageOfCourses(latest.courses);
}


function letterGrade(avg) {
  if (avg === null || avg === undefined) return '-';
  if (avg >= 90) return 'A';
  if (avg >= 80) return 'B';
  if (avg >= 70) return 'C';
  if (avg >= 60) return 'D';
  return 'F';
}


function isPassing(avg) {
  if (avg === null || avg === undefined) return false;
  return avg >= PASS_THRESHOLD;
}


const STORAGE_KEY = 'studentDetails_history_v1';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse student history from storage', e);
    return null;
  }
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to write student history to storage', e);
  }
}

export default function StudentDetails() {
  const [students, setStudents] = useState([]);
  const [expanded, setExpanded] = useState({});

  
  useEffect(() => {
    const persisted = loadFromStorage();
    if (persisted && Array.isArray(persisted) && persisted.length > 0) {
      setStudents(persisted);
    } else {
      setStudents(sampleStudents);
      saveToStorage(sampleStudents);
    }
  }, []);

  
  function toggleExpand(id) {
    setExpanded((s) => ({ ...s, [id]: !s[id] }));
  }

 
  function addTermRecord(studentId) {
    setStudents((prev) => {
      const next = prev.map((stu) => {
        if (stu.id !== studentId) return stu;
        const newTermIndex = (stu.history.length + 2024).toString();
       
        const newRecord = {
          term: `Auto ${new Date().getFullYear()}#${stu.history.length + 1}`,
          courses: [
            { name: 'RandomSubject', score: Math.floor(Math.random() * 41) + 60 },
            { name: 'Elective', score: Math.floor(Math.random() * 41) + 50 },
          ],
        };
        const updated = { ...stu, history: [...stu.history, newRecord] };
        return updated;
      });
      saveToStorage(next);
      return next;
    });
  }

  
  function clearLogs() {
    localStorage.removeItem(STORAGE_KEY);
    setStudents(sampleStudents);
    setExpanded({});
  }

  return (
    <Layout>
      
      <div className="glass-card p-6" style={{ color: '#0f172a' }}>
      <h2>Student Details & Academic History</h2>
      <p style={{ marginTop: 0 }}>
        Pass threshold: {PASS_THRESHOLD}% - Letter grades: A(90+), B(80+), C(70+), D(60+), F(&lt;60)
      </p>

  <div style={{ marginBottom: 12 }}>
        <button onClick={() => {
          
          saveToStorage(sampleStudents);
          setStudents(sampleStudents);
          setExpanded({});
        }}>Reset to sample data</button>
        <button style={{ marginLeft: 8 }} onClick={clearLogs}>Clear persisted logs</button>
  </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Photo</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Name</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Admission #</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Phone</th>
            <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd' }}>Latest Avg</th>
            <th style={{ textAlign: 'center', borderBottom: '1px solid #ddd' }}>Letter</th>
            <th style={{ textAlign: 'center', borderBottom: '1px solid #ddd' }}>Academic Status</th>
            <th style={{ textAlign: 'center', borderBottom: '1px solid #ddd' }}>Payment Status</th>
            <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd' }}>Balance</th>
            <th style={{ textAlign: 'center', borderBottom: '1px solid #ddd' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((stu) => {
            const avg = latestAverage(stu);
            const letter = letterGrade(avg);
            const pass = isPassing(avg);
            return (
              <React.Fragment key={stu.id}>
                <tr>
                  <td style={{ padding: '8px 4px' }}>
                    <img 
                      src={stu.photo} 
                      alt={stu.name}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  </td>
                  <td style={{ padding: '8px 4px' }}>{stu.name}</td>
                  <td style={{ padding: '8px 4px', fontSize: '12px', color: '#666' }}>
                    {stu.admissionNumber}
                  </td>
                  <td style={{ padding: '8px 4px', fontSize: '12px', color: '#666' }}>
                    {stu.contact?.phoneNumber || 'No phone'}
                  </td>
                  <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                    {avg === null ? '-' : avg.toFixed(1)}
                  </td>
                  <td style={{ textAlign: 'center' }}>{letter}</td>
                  <td style={{ textAlign: 'center', color: pass ? 'green' : 'crimson' }}>
                    {pass ? 'Pass' : 'Fail'}
                  </td>
                  <td style={{ textAlign: 'center', padding: '8px 4px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      color: 'white',
                      backgroundColor: stu.financial?.paymentStatus === 'Paid' ? 'green' : 
                                     stu.financial?.paymentStatus === 'Partially Paid' ? 'orange' : 'red'
                    }}>
                      {stu.financial?.paymentStatus || 'Not Set'}
                    </span>
                  </td>
                  <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 'bold' }}>
                    ${stu.financial?.balance || 0}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => toggleExpand(stu.id)}>
                      {expanded[stu.id] ? 'Hide details' : 'Show details'}
                    </button>
                    <button style={{ marginLeft: 8 }} onClick={() => addTermRecord(stu.id)}>Add term</button>
                  </td>
                </tr>

                {expanded[stu.id] && (
                  <tr>
                    <td colSpan={10} style={{ padding: 8, background: '#fafafa' }}>
                      {/* Student Header Section */}
                      <div style={{ 
                        marginBottom: 20, 
                        padding: 15, 
                        background: 'white', 
                        border: '2px solid #e5e7eb', 
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 15
                      }}>
                        <img 
                          src={stu.photo} 
                          alt={stu.name}
                          style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '3px solid #3b82f6'
                          }}
                        />
                        <div>
                          <h3 style={{ margin: 0, color: '#1f2937', fontSize: '24px', fontWeight: 'bold' }}>
                            {stu.name}
                          </h3>
                          <p style={{ margin: '5px 0', color: '#6b7280', fontSize: '16px' }}>
                            Admission Number: <strong>{stu.admissionNumber}</strong>
                          </p>
                          <p style={{ margin: '5px 0', color: '#6b7280', fontSize: '14px' }}>
                            {stu.contact?.phoneNumber} • {stu.contact?.email}
                          </p>
                        </div>
                        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                          <div style={{ 
                            padding: '8px 16px', 
                            borderRadius: '20px', 
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: 'white',
                            backgroundColor: pass ? '#10b981' : '#ef4444'
                          }}>
                            {pass ? 'PASSING' : 'FAILING'}
                          </div>
                          <div style={{ marginTop: 8, fontSize: '12px', color: '#6b7280' }}>
                            Average: {avg === null ? 'No grades' : avg.toFixed(1)}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 15 }}>
                        {/* Contact Information */}
                        <div>
                          <strong>Contact Information</strong>
                          <div style={{ marginTop: 12, padding: 12, border: '1px solid #ddd', borderRadius: '6px', background: 'white' }}>
                            <div style={{ marginBottom: 8 }}>
                              <div style={{ fontWeight: 600, color: '#333', fontSize: '12px' }}>Primary Phone:</div>
                              <div style={{ fontSize: '14px', color: '#2563eb' }}>
                                <a href={`tel:${stu.contact?.phoneNumber}`} style={{ textDecoration: 'none', color: '#2563eb' }}>
                                  {stu.contact?.phoneNumber || 'Not provided'}
                                </a>
                              </div>
                            </div>
                            
                            {stu.contact?.alternatePhone && (
                              <div style={{ marginBottom: 8 }}>
                                <div style={{ fontWeight: 600, color: '#333', fontSize: '12px' }}>Alternate Phone:</div>
                                <div style={{ fontSize: '14px', color: '#2563eb' }}>
                                  <a href={`tel:${stu.contact.alternatePhone}`} style={{ textDecoration: 'none', color: '#2563eb' }}>
                                    {stu.contact.alternatePhone}
                                  </a>
                                </div>
                              </div>
                            )}
                            
                            <div style={{ marginBottom: 8 }}>
                              <div style={{ fontWeight: 600, color: '#333', fontSize: '12px' }}>Email:</div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                <a href={`mailto:${stu.contact?.email}`} style={{ textDecoration: 'none', color: '#666' }}>
                                  {stu.contact?.email || 'Not provided'}
                                </a>
                              </div>
                            </div>
                            
                            {stu.contact?.emergencyContact && (
                              <div style={{ 
                                marginTop: 10, 
                                padding: 8, 
                                border: '1px solid #fbbf24', 
                                borderRadius: '4px', 
                                background: '#fffbeb' 
                              }}>
                                <div style={{ fontWeight: 600, color: '#92400e', fontSize: '11px' }}>Emergency Contact:</div>
                                <div style={{ fontSize: '11px', color: '#92400e' }}>
                                  <div>{stu.contact.emergencyContact.name}</div>
                                  <div>
                                    <a href={`tel:${stu.contact.emergencyContact.phone}`} style={{ textDecoration: 'none', color: '#92400e' }}>
                                      {stu.contact.emergencyContact.phone}
                                    </a>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Financial Information */}
                        <div>
                          <strong>Financial Information</strong>
                          <div style={{ marginTop: 12, padding: 12, border: '1px solid #ddd', borderRadius: '6px', background: 'white' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                              <div>
                                <div style={{ fontWeight: 600, color: '#333', fontSize: '12px' }}>Total Fee Required:</div>
                                <div style={{ fontSize: '16px', color: '#2563eb' }}>${stu.financial?.totalFeeRequired || 0}</div>
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: '#333', fontSize: '12px' }}>Amount Paid:</div>
                                <div style={{ fontSize: '16px', color: '#059669' }}>${stu.financial?.amountPaid || 0}</div>
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: '#333', fontSize: '12px' }}>Balance:</div>
                                <div style={{ fontSize: '16px', color: stu.financial?.balance > 0 ? '#dc2626' : '#059669' }}>
                                  ${stu.financial?.balance || 0}
                                </div>
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: '#333', fontSize: '12px' }}>Last Payment:</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                  {stu.financial?.lastPaymentDate ? new Date(stu.financial.lastPaymentDate).toLocaleDateString() : 'None'}
                                </div>
                              </div>
                            </div>
                            
                            {/* Payment History */}
                            <div style={{ marginTop: 12 }}>
                              <div style={{ fontWeight: 600, marginBottom: 6, color: '#333', fontSize: '12px' }}>Payment History:</div>
                              {(!stu.financial?.paymentHistory || stu.financial.paymentHistory.length === 0) ? (
                                <em style={{ color: '#666', fontSize: '11px' }}>No payments yet</em>
                              ) : (
                                <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                                  {stu.financial.paymentHistory.map((payment, idx) => (
                                    <div key={idx} style={{ 
                                      padding: 6, 
                                      marginBottom: 3, 
                                      border: '1px solid #e5e7eb', 
                                      borderRadius: '3px',
                                      background: '#f9fafb',
                                      fontSize: '11px'
                                    }}>
                                      <div><strong>${payment.amount}</strong> - {payment.method}</div>
                                      <div style={{ color: '#666' }}>{new Date(payment.date).toLocaleDateString()}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Food Ordering Information */}
                        <div>
                          <strong>Food Ordering Details</strong>
                          <div style={{ marginTop: 12, padding: 12, border: '1px solid #ddd', borderRadius: '6px', background: 'white' }}>
                            {/* Delivery Address */}
                            <div style={{ marginBottom: 12 }}>
                              <div style={{ fontWeight: 600, color: '#333', fontSize: '12px' }}>Delivery Address:</div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                <div><strong>{stu.foodOrdering?.deliveryAddress?.type}</strong></div>
                                <div>{stu.foodOrdering?.deliveryAddress?.details}</div>
                                <div>{stu.foodOrdering?.deliveryAddress?.phone}</div>
                              </div>
                            </div>

                            {/* Preferred Payment Method */}
                            <div style={{ marginBottom: 12 }}>
                              <div style={{ fontWeight: 600, color: '#333', fontSize: '12px' }}>Payment Method:</div>
                              <div style={{ fontSize: '14px', color: '#2563eb' }}>{stu.foodOrdering?.preferredPaymentMethod}</div>
                            </div>

                            {/* Recent Orders */}
                            <div style={{ marginBottom: 12 }}>
                              <div style={{ fontWeight: 600, marginBottom: 6, color: '#333', fontSize: '12px' }}>Recent Orders:</div>
                              {(!stu.foodOrdering?.orderHistory || stu.foodOrdering.orderHistory.length === 0) ? (
                                <em style={{ color: '#666', fontSize: '11px' }}>No orders yet</em>
                              ) : (
                                <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                                  {stu.foodOrdering.orderHistory.slice(0, 3).map((order, idx) => (
                                    <div key={idx} style={{ 
                                      padding: 6, 
                                      marginBottom: 3, 
                                      border: '1px solid #e5e7eb', 
                                      borderRadius: '3px',
                                      background: '#f9fafb',
                                      fontSize: '11px'
                                    }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div><strong>${order.total}</strong></div>
                                        <div style={{ 
                                          fontSize: '10px', 
                                          padding: '2px 4px', 
                                          borderRadius: '2px',
                                          background: order.status === 'Delivered' ? '#dcfce7' : 
                                                     order.status === 'Pending' ? '#fef3c7' : '#fee2e2',
                                          color: order.status === 'Delivered' ? '#166534' : 
                                                order.status === 'Pending' ? '#92400e' : '#991b1b'
                                        }}>
                                          {order.status}
                                        </div>
                                      </div>
                                      <div style={{ color: '#666' }}>{order.items.join(', ')}</div>
                                      <div style={{ color: '#666' }}>{new Date(order.date).toLocaleDateString()}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Saved Favorites */}
                            <div>
                              <div style={{ fontWeight: 600, marginBottom: 6, color: '#333', fontSize: '12px' }}>Favorites:</div>
                              {(!stu.foodOrdering?.savedFavorites || stu.foodOrdering.savedFavorites.length === 0) ? (
                                <em style={{ color: '#666', fontSize: '11px' }}>No favorites saved</em>
                              ) : (
                                <div>
                                  {stu.foodOrdering.savedFavorites.map((fav, idx) => (
                                    <div key={idx} style={{ 
                                      padding: 4, 
                                      marginBottom: 2, 
                                      border: '1px solid #e5e7eb', 
                                      borderRadius: '3px',
                                      background: '#fffbeb',
                                      fontSize: '11px'
                                    }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div>{fav.name}</div>
                                        <div style={{ fontWeight: 600, color: '#f59e0b' }}>${fav.price}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Academic History */}
                        <div>
                          <strong>Academic History</strong>
                          <div style={{ marginTop: 12 }}>
                            {(!stu.history || stu.history.length === 0) && <em>No history available</em>}
                            {stu.history && stu.history.map((z, idx) => (
                              <div key={idx} style={{ marginBottom: 8, padding: 8, border: '1px solid #eee', borderRadius: '4px', background: 'white' }}>
                                <div style={{ fontWeight: 600, fontSize: '12px' }}>{z.term}</div>
                                <div style={{ marginTop: 6 }}>
                                  {z.courses.map((c, i) => (
                                    <div key={i} style={{ marginBottom: 4 }}>
                                      <div style={{ fontSize: '11px' }}>{c.name}: {c.score}</div>
                                    </div>
                                  ))}
                                  <div style={{ marginTop: 6, fontSize: '11px', color: '#666' }}>
                                    <div>Avg: {averageOfCourses(z.courses).toFixed(1)} ({letterGrade(averageOfCourses(z.courses))})</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      <div style={{ marginTop: 18, color: '#666' }}>
        <strong>Console history log</strong>
        <div>
          For debugging, the component also persists the full students object to localStorage under key <code>{STORAGE_KEY}</code>.
        </div>
      </div>
      </div>
    </Layout>
  );
}
