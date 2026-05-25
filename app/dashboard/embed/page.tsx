'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import DashboardNav from '@/components/DashboardNav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Copy, Code } from 'lucide-react'

export default function EmbedPage() {
  const [businessId, setBusinessId] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com'

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user.id)
        .single()
      if (data) setBusinessId(data.id)
      setLoading(false)
    }
    load()
  }, [])

  const embedCode = `<script src="${appUrl}/embed.js" data-id="${businessId}"></script>`
  const widgetUrl = `${appUrl}/widget/${businessId}`

  function copy() {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardNav />
      <main className="flex-1 overflow-auto p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Install Your Chat Widget</h1>
        <p className="text-gray-500 text-sm mb-8">Add your AI assistant to your website in under 60 seconds.</p>

        {loading ? (
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        ) : (
          <div className="space-y-6">
            {/* Step 1 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Badge className="w-6 h-6 rounded-full flex items-center justify-center p-0">1</Badge>
                  Copy your embed code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm text-green-400 relative">
                  <code className="break-all">{embedCode}</code>
                  <button
                    onClick={copy}
                    className="absolute top-3 right-3 bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-md text-xs flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Badge className="w-6 h-6 rounded-full flex items-center justify-center p-0">2</Badge>
                  Paste it on your website
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <p>Paste the code above just before the <code className="bg-gray-100 px-1 rounded">&lt;/body&gt;</code> tag on every page of your website.</p>
                <div className="grid gap-3">
                  <InstallOption
                    name="WordPress"
                    steps={['Go to Appearance → Theme Editor', 'Open footer.php', 'Paste just before </body>', 'Click Update File']}
                  />
                  <InstallOption
                    name="Squarespace"
                    steps={['Settings → Advanced → Code Injection', 'Paste in the Footer section', 'Click Save']}
                  />
                  <InstallOption
                    name="Wix"
                    steps={['Settings → Custom Code', 'Add code → Body (end)', 'Paste and save']}
                  />
                  <InstallOption
                    name="GoDaddy Website Builder"
                    steps={['Pages → SEO/Tracking', 'Add Script', 'Paste and save']}
                  />
                </div>
                <p className="text-xs text-gray-400 pt-2">Don't have a website? Share your direct chat link instead:</p>
                <div className="flex items-center gap-2 bg-gray-50 border rounded-lg p-3">
                  <Code className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-600 break-all">{widgetUrl}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(widgetUrl)}
                    className="ml-auto text-blue-600 text-xs hover:underline flex-shrink-0"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-gray-400">Add this link to your Google Business profile, social media bio, or any text message.</p>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Badge className="w-6 h-6 rounded-full flex items-center justify-center p-0">3</Badge>
                  Test it
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Open your website in a new tab and look for the blue chat bubble in the bottom-right corner. Click it and send a test message.
                </p>
                <a
                  href={widgetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Preview your AI chat
                </a>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

function InstallOption({ name, steps }: { name: string; steps: string[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        {name}
        <span className="text-gray-400">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-4 pb-3 border-t bg-gray-50">
          <ol className="list-decimal list-inside space-y-1 text-xs text-gray-600 pt-2">
            {steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>
      )}
    </div>
  )
}
