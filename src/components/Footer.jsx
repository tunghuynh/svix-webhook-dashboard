export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Svix Webhook Dashboard. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Powered by{' '}
            <a
              href="https://tunghuynh.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Tùng Huynh
            </a>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <a
              href="https://buymeacoffee.com/tunghuynhts"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Buy me a coffee
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
