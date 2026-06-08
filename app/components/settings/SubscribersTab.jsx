
import { Icon } from "@shopify/polaris";
import { DeleteIcon } from "@shopify/polaris-icons";

export default function SubscribersTab({
  subscribers,
  subscriberSearch,
  setSubscriberSearch,
  settings,
  deleteFetcher
}) {
  const filteredSubscribers = subscribers.filter(sub => 
    sub.email.toLowerCase().includes(subscriberSearch.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ["Email", "Subscription Date"];
    const rows = filteredSubscribers.map(sub => [
      sub.email,
      new Date(sub.createdAt).toLocaleString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `subscribers-${settings?.shop || 'store'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (window.shopify) {
      window.shopify.toast.show("CSV Exported successfully!");
    }
  };

  return (
    <>
      <div className="section-card">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Email Subscribers List</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6d7175' }}>All email addresses collected from your Announcement and Newsletter popup</p>
          </div>
          {filteredSubscribers.length > 0 && (
            <button
              type="button"
              onClick={handleExportCSV}
              style={{
                background: '#008060',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 4px rgba(0, 128, 96, 0.15)'
              }}
            >
              <svg viewBox="0 0 20 20" width="16" fill="currentColor" style={{ marginRight: '4px' }}><path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v6.59l1.97-1.97a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L6.22 9.43a.75.75 0 0 1 1.06-1.06l1.97 1.97V3.75A.75.75 0 0 1 10 3ZM3 15.75a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" /></svg>
              Export CSV
            </button>
          )}
        </div>
        
        <div className="section-body" style={{ padding: 0 }}>
          {subscribers.length === 0 ? (
            <div style={{ padding: '60px 40px', textAlign: 'center' }}>
              <div style={{ background: '#f4f6f8', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg viewBox="0 0 20 20" width="32" fill="#8c9196"><path d="M3 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.22l-2.43 2.13a.5.5 0 0 1-.7 0l-2.43-2.13H5a2 2 0 0 1-2-2V5Zm2 .5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-2.5a.5.5 0 0 0-.33.13l-1.67 1.46-1.67-1.46a.5.5 0 0 0-.33-.13H5.5a.5.5 0 0 1-.5-.5v-8Z" /></svg>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#202223', margin: '0 0 8px 0' }}>No Subscribers Yet</h3>
              <p style={{ color: '#6d7175', fontSize: '13px', margin: 0, maxWidth: '300px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.4' }}>
                Turn on Email collection in the **Announcements** tab to start collecting leads.
              </p>
            </div>
          ) : (
            <>
              {/* Search Bar */}
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #e1e3e5', display: 'flex', gap: '12px', background: '#f9fafb' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <svg viewBox="0 0 20 20" width="16" fill="#8c9196" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search subscribers by email..."
                    value={subscriberSearch}
                    onChange={(e) => setSubscriberSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 36px',
                      border: '1px solid #d2d5d8',
                      borderRadius: '8px',
                      fontSize: '13px',
                      background: '#ffffff',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#008060'}
                    onBlur={(e) => e.target.style.borderColor = '#d2d5d8'}
                  />
                  {subscriberSearch && (
                    <button
                      type="button"
                      onClick={() => setSubscriberSearch("")}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        color: '#8c9196',
                        padding: 0
                      }}
                    >
                      <svg viewBox="0 0 20 20" width="16" fill="currentColor"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" /></svg>
                    </button>
                  )}
                </div>
              </div>

              {filteredSubscribers.length === 0 ? (
                <div style={{ padding: '40px 24px', textAlign: 'center', color: '#6d7175', fontSize: '14px' }}>
                  No subscribers found matching "<strong>{subscriberSearch}</strong>"
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f6f6f7', borderBottom: '1px solid #e1e3e5', color: '#6d7175', fontWeight: '600' }}>
                        <th style={{ padding: '14px 24px' }}>Email Address</th>
                        <th style={{ padding: '14px 24px' }}>Subscription Date</th>
                        <th style={{ padding: '14px 24px' }}>Status</th>
                        <th style={{ padding: '14px 24px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubscribers.map((sub, idx) => (
                        <tr key={sub.id || idx} style={{ borderBottom: '1px solid #f1f2f4', color: '#202223', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                          <td style={{ padding: '14px 24px', fontWeight: '600', fontFamily: 'monospace' }}>{sub.email}</td>
                          <td style={{ padding: '14px 24px', color: '#6d7175' }}>{new Date(sub.createdAt).toLocaleString()}</td>
                          <td style={{ padding: '14px 24px' }}>
                            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '50px', fontSize: '11px', fontWeight: '700' }}>ACTIVE</span>
                          </td>
                          <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${sub.email}?`)) {
                                  deleteFetcher.submit(
                                    { actionType: "deleteSubscriber", subscriberId: sub.id.toString() },
                                    { method: "POST" }
                                  );
                                }
                              }}
                              style={{
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#fbeaeb'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                            >
                              <Icon source={DeleteIcon} tone="critical" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
