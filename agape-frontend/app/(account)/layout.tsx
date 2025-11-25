import { AccountSidebar } from "@/components/account-sidebar"

export default function AccountLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className="flex flex-col md:flex-row h-screen w-full bg-neutral-100 dark:bg-neutral-900">
			<AccountSidebar />
			<main className="flex-1 overflow-y-auto">
				<div className="p-2 md:p-10 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 md:rounded-tl-2xl h-full">
					{children}
				</div>
			</main>
		</div>
	)
}
