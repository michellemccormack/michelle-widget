/**
 * AI Campaign Assistant demo - matches public/demo.html, widget is in layout.
 */

export default function DemoPage() {
  return (
    <main
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
        background: '#ffffff',
        minHeight: '100vh',
        padding: '60px 20px 120px 20px',
      }}
    >
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <h1
          style={{
            fontSize: 42,
            fontWeight: 700,
            color: '#1a202c',
            marginBottom: 24,
            lineHeight: 1.2,
          }}
        >
          AI Campaign Assistant
        </h1>

        <h2
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: '#2d3748',
            margin: '40px 0 20px 0',
          }}
        >
          What it does:
        </h2>
        <ul style={{ listStyle: 'none', marginBottom: 40 }}>
          {[
            'Answers voter questions 24/7',
            'Captures qualified leads automatically',
            "Matches your campaign's voice and brand",
            'Costs pennies per conversation',
          ].map((item) => (
            <li
              key={item}
              style={{
                fontSize: 18,
                color: '#2d3748',
                padding: '14px 0 14px 36px',
                position: 'relative',
                lineHeight: 1.5,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  color: '#10b981',
                  fontWeight: 'bold',
                  fontSize: 22,
                }}
              >
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>

        <div
          style={{
            background: '#f8fafc',
            borderLeft: '4px solid #6366f1',
            padding: '20px 24px',
            margin: '40px 0',
            borderRadius: 4,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 17,
              color: '#334155',
            }}
          >
            <strong>See it in action in the bottom right</strong> — ask about
            policies, volunteer opportunities, or voter registration. Watch how
            it engages and converts.
          </p>
        </div>
      </div>
    </main>
  );
}
