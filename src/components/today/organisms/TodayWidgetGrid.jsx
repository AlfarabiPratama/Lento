/**
 * TodayWidgetGrid - Responsive grid layout for Today widgets
 * 
 * Very small screens (<520px): 1 column stack
 * Small+ screens (>=520px): 2x2 grid
 * 
 * Note: 2 columns need ~500px total (468px grid + 32px padding)
 * so we use 520px breakpoint for safe margin
 */
export function TodayWidgetGrid({ children, className = '' }) {
    return (
        <div className={`
      grid gap-2 sm:gap-4
      grid-cols-1 min-[520px]:grid-cols-2
      ${className}
    `}>
            {children}
        </div>
    )
}

export default TodayWidgetGrid



