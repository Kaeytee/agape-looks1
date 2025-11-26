"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
	IconArrowLeft,
	IconLayoutDashboard,
	IconShoppingBag,
	IconUser,
	IconHeart,
	IconLogout,
	IconUsers,
	IconPackage
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion"; // Corrected import for motion
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/contexts/auth-context";
import { usePathname } from "next/navigation";

export function AccountSidebar() {
	const { user, logout } = useAuth();
	const isAdmin = user?.role === 'admin';
	const [open, setOpen] = useState(false);
	const [mounted, setMounted] = useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	const links = [
		{
			label: "Dashboard",
			href: "/account",
			icon: (
				<IconLayoutDashboard className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
			),
		},
		{
			label: "Orders",
			href: "/account/orders",
			icon: (
				<IconShoppingBag className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
			),
		},
		{
			label: "Profile",
			href: "/account/profile",
			icon: (
				<IconUser className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
			),
		},
		{
			label: "Wishlist",
			href: "/wishlist",
			icon: (
				<IconHeart className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
			),
		},
	];

	const adminLinks = [
		{
			label: "Admin Overview",
			href: "/admin",
			icon: (
				<IconLayoutDashboard className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
			),
		},
		{
			label: "Products",
			href: "/admin/products",
			icon: (
				<IconPackage className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
			),
		},
		{
			label: "Collections",
			href: "/admin/collections",
			icon: (
				<IconLayoutDashboard className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
			),
		},
		{
			label: "All Orders",
			href: "/admin/orders",
			icon: (
				<IconShoppingBag className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
			),
		},
		{
			label: "Customers",
			href: "/admin/customers",
			icon: (
				<IconUsers className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
			),
		},
		{
			label: "Settings",
			href: "/admin/settings",
			icon: (
				<IconLayoutDashboard className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
			),
		},
	];

	return (
		<Sidebar open={open} setOpen={setOpen}>
			<SidebarBody className="justify-between gap-10">
				<div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
					{open ? <Logo /> : <LogoIcon />}
					<div className="mt-8 flex flex-col gap-2">
						<SidebarLink
							link={{
								label: "Back to Store",
								href: "/",
								icon: <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
							}}
						/>

						{mounted && isAdmin && (
							<>
								<div className="my-2 border-t border-neutral-200 dark:border-neutral-700" />
								<div className="px-2 py-1 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
									{open ? "Admin" : "..."}
								</div>
								{adminLinks.map((link, idx) => (
									<SidebarLink key={`admin-${idx}`} link={link} />
								))}
							</>
						)}

						{mounted && !isAdmin && (
							<>
								<div className="my-2 border-t border-neutral-200 dark:border-neutral-700" />
								<div className="px-2 py-1 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
									{open ? "Account" : "..."}
								</div>
								{links.map((link, idx) => (
									<SidebarLink key={idx} link={link} />
								))}
							</>
						)}
					</div>
				</div>
				<div>
					<SidebarLink
						link={{
							label: "Log Out",
							href: "#",
							icon: (
								<IconLogout className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
							),
						}}
						onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
							e.preventDefault();
							logout();
						}}
					/>
				</div>
			</SidebarBody>
		</Sidebar>
	);
}

export const Logo = () => {
	return (
		<Link
			href="/"
			className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
		>
			<div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
			<motion.span
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="font-medium text-black dark:text-white whitespace-pre"
			>
				AGAPE LOOKS
			</motion.span>
		</Link>
	);
};

export const LogoIcon = () => {
	return (
		<Link
			href="/"
			className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
		>
			<div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
		</Link>
	);
};
