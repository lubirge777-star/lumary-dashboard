export type ToolParam = string | number | boolean | string[] | undefined

export interface ToolDef {
  name: string
  description: string
  parameters: Record<string, {
    type: string
    description: string
    required?: boolean
    enum?: string[]
  }>
  handler: (args: Record<string, ToolParam>) => Promise<{ success: boolean; data?: any; error?: string }>
}
