/**
 * Demo page - shows the widget in action.
 * Widget is rendered via WidgetWrapper in layout.
 */

export default function DemoPage() {
  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        AI Engagement Widget
      </h1>
      <p className="text-gray-600 mb-6">
        This is the demo page. The chat bubble should appear in the bottom-right
        corner. Click it to open the widget and try asking a question.
      </p>
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-2">Embed snippet</h2>
        <p className="text-sm text-gray-600 mb-4">
          Add this to any website to embed the widget:
        </p>
        <pre className="text-xs bg-gray-800 text-gray-100 p-4 rounded overflow-x-auto">
          {`<script
  src="https://your-domain.vercel.app/widget.js"
  data-api-url="https://your-domain.vercel.app/api"
  async
></script>`}
        </pre>
      </div>
      <p className="mt-6 text-sm text-gray-500">
        Make sure to run <code className="bg-gray-100 px-1 rounded">npm run build:widget</code> before
        deploying to generate the widget bundle.
      </p>
    </main>
  );
}
