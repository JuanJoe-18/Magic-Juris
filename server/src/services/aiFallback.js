const { OpenAI, AzureOpenAI } = require('openai')
const { GoogleGenerativeAI } = require('@google/generative-ai')

function getProviders() {
  const providers = []

  if (process.env.OPENCODE_API_KEY) {
    providers.push({
      name: 'OpenCode',
      call: async (messages, responseFormat, temperature) => {
        const client = new OpenAI({
          apiKey: process.env.OPENCODE_API_KEY,
          baseURL: 'https://opencode.ai/zen/v1',
        })
        const res = await client.chat.completions.create({
          model: process.env.OPENCODE_MODEL || 'gpt-4o-mini',
          messages,
          temperature: temperature || 0.3,
          response_format: responseFormat === 'json' ? { type: 'json_object' } : undefined
        })
        return res.choices[0].message.content
      }
    })
  }

  if (process.env.AZURE_OPENAI_API_KEY) {
    providers.push({
      name: 'Azure OpenAI',
      call: async (messages, responseFormat, temperature) => {
        const endpoint = process.env.AZURE_OPENAI_ENDPOINT.replace(/\/openai\/v1\/?$/, '')
        const client = new AzureOpenAI({
          apiKey: process.env.AZURE_OPENAI_API_KEY,
          endpoint: endpoint,
          apiVersion: '2024-02-01',
          deployment: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini'
        })
        const res = await client.chat.completions.create({
          model: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini',
          messages,
          temperature: temperature || 0.3,
          response_format: responseFormat === 'json' ? { type: 'json_object' } : undefined
        })
        return res.choices[0].message.content
      }
    })
  }

  if (process.env.GEMINI_API_KEY) {
    providers.push({
      name: 'Google Gemini',
      call: async (messages, responseFormat, temperature) => {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        const systemMsg = messages.find(m => m.role === 'system')
        const systemInstruction = systemMsg ? systemMsg.content : undefined
        const userMessages = messages.filter(m => m.role !== 'system')
        const historyRaw = userMessages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }))
        const prompt = historyRaw.pop().parts[0].text
        const model = genAI.getGenerativeModel({
          model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
          systemInstruction,
          generationConfig: { temperature: temperature || 0.3, responseMimeType: responseFormat === 'json' ? 'application/json' : 'text/plain' },
        })
        const chatSession = model.startChat({ history: historyRaw })
        const result = await chatSession.sendMessage(prompt)
        return result.response.text()
      }
    })
  }
  return providers
}

async function executeWithFallback(messages, responseFormat = 'text', temperature = 0.3) {
  const providers = getProviders()
  if (providers.length === 0) throw new Error('No API Keys configured.')
  let lastError = null
  for (const provider of providers) {
    try {
      console.log(`[IA] Probando -> ${provider.name} ...`)
      const text = await provider.call(messages, responseFormat, temperature)
      console.log(`[IA] Exito con -> ${provider.name}`)
      return text
    } catch (e) {
      console.log(`[IA] Fallo con -> ${provider.name}: ${e.message}`)
      lastError = e
    }
  }
  throw new Error(`Todos los proveedores fallaron. Ultimo error: ${lastError.message}`)
}

module.exports = { executeWithFallback }
