import * as React from 'react'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string
  height?: string
  rounded?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  rounded = '0.375rem',
  className,
  ...props
}) => {
  return (
    <div
      role="status"
      aria-busy="true"
      className={`bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800 animate-pulse ${className ?? ''}`}
      style={{ width, height, borderRadius: rounded }}
      {...props}
    />
  )
}

export default Skeleton
