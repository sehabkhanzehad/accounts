import * as React from "react"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useTranslation } from 'react-i18next'
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  LayoutDashboard,
  Users,
  Receipt,
  CreditCard,
  Wallet,
} from "lucide-react"

import { NavMain } from '@/components/nav-main'
import { NavProjects } from '@/components/nav-projects'
import { NavUser } from '@/components/nav-user'
import { Logo } from '@/components/nav-logo'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'

// This is sample data.
// const data = {
//   navMain: [
//     {
//       title: "Dashboard",
//       url: "/dashboard",
//       icon: LayoutDashboard,
//       isActive: true,
//       items: [
//         {
//           title: "Overview",
//           url: "/dashboard",
//         },
//         {
//           title: "Analytics",
//           url: "/dashboard/analytics",
//         },
//         {
//           title: "Reports",
//           url: "/dashboard/reports",
//         },
//       ],
//     },
//     {
//       title: "Accounts",
//       url: "/accounts",
//       icon: Wallet,
//       items: [
//         {
//           title: "All Accounts",
//           url: "/accounts",
//         },
//         {
//           title: "Transactions",
//           url: "/accounts/transactions",
//         },
//         {
//           title: "Reconciliation",
//           url: "/accounts/reconciliation",
//         },
//       ],
//     },
//     {
//       title: "Invoices",
//       url: "/invoices",
//       icon: Receipt,
//       items: [
//         {
//           title: "All Invoices",
//           url: "/invoices",
//         },
//         {
//           title: "Create Invoice",
//           url: "/invoices/create",
//         },
//         {
//           title: "Drafts",
//           url: "/invoices/drafts",
//         },
//       ],
//     },
//     {
//       title: "Payments",
//       url: "/payments",
//       icon: CreditCard,
//       items: [
//         {
//           title: "All Payments",
//           url: "/payments",
//         },
//         {
//           title: "Pending",
//           url: "/payments/pending",
//         },
//         {
//           title: "History",
//           url: "/payments/history",
//         },
//       ],
//     },
//     {
//       title: "Settings",
//       url: "/dashboard/settings/account",
//       icon: Settings2,
//       items: [
//         {
//           title: "Account",
//           url: "/dashboard/settings/account",
//         },
//         {
//           title: "Password",
//           url: "/dashboard/settings/password",
//         },
//         {
//           title: "Years",
//           url: "/dashboard/settings/years",
//         },
//       ],
//     },
//   ],
//   projects: [
//     {
//       name: "Company Accounts",
//       url: "/projects/company",
//       icon: Frame,
//     },
//     {
//       name: "Tax Planning",
//       url: "/projects/tax",
//       icon: PieChart,
//     },
//     {
//       name: "Budget 2025",
//       url: "/projects/budget",
//       icon: Map,
//     },
//   ],
// }

export function AppSidebar({ ...props }) {
  const { user } = useAuth();
  const { t } = useTranslation();

  const displayUser = {
    name: user.attributes.name,
    email: user.attributes.email,
    avatar: "",
  };

  const navMain = [
    {
      title: t('app.dashboard'),
      url: "/dashboard",
      icon: LayoutDashboard,
      items: [
        {
          title: t('app.overview'),
          url: "/dashboard",
        },
        {
          title: t('app.analytics'),
          url: "/dashboard/analytics",
        },
        {
          title: t('app.reports'),
          url: "/dashboard/reports",
        },
      ],
    },
    // {
    //   title: t('app.accounts'),
    //   url: "/accounts",
    //   icon: Wallet,
    //   items: [
    //     {
    //       title: t('app.allAccounts'),
    //       url: "/accounts",
    //     },
    //     {
    //       title: t('app.transactions'),
    //       url: "/accounts/transactions",
    //     },
    //     {
    //       title: t('app.reconciliation'),
    //       url: "/accounts/reconciliation",
    //     },
    //   ],
    // },
    // {
    //   title: t('app.invoices'),
    //   url: "/invoices",
    //   icon: Receipt,
    //   items: [
    //     {
    //       title: t('app.allInvoices'),
    //       url: "/invoices",
    //     },
    //     {
    //       title: t('app.createInvoice'),
    //       url: "/invoices/create",
    //     },
    //     {
    //       title: t('app.drafts'),
    //       url: "/invoices/drafts",
    //     },
    //   ],
    // },
    // {
    //   title: t('app.payments'),
    //   url: "/payments",
    //   icon: CreditCard,
    //   items: [
    //     {
    //       title: t('app.allPayments'),
    //       url: "/payments",
    //     },
    //     {
    //       title: t('app.pending'),
    //       url: "/payments/pending",
    //     },
    //     {
    //       title: t('app.history'),
    //       url: "/payments/history",
    //     },
    //   ],
    // },
    // {
    //   title: t('app.settings'),
    //   url: "/settings/profile",
    //   icon: Settings2,
    //   items: [
    //     {
    //       title: t('app.profile'),
    //       url: "/settings/profile",
    //     },
    //     {
    //       title: t('app.password'),
    //       url: "/settings/password",
    //     },
    //     {
    //       title: t('app.yearsManagement'),
    //       url: "/settings/years",
    //     },
    //     {
    //       title: t('app.appearance'),
    //       url: "/settings/appearance",
    //     },
    //   ],
    // },
  ];

  const management = [
    {
      title: t('app.sidebar.menu.pilgrims'),
      url: "/pilgrims",
      icon: Users,
      items: [
        {
          title: t('app.sidebar.options.allPilgrim'),
          url: "/dashboard/analytics",
        },
        {
          title: t('app.sidebar.options.groupLeader'),
          url: "/dashboard",
        },
        {
          title: t('app.sidebar.options.preRegistration'),
          url: "/dashboard/reports",
        },
        {
          title: t('app.sidebar.options.registration'),
          url: "/dashboard/reports",
        },
      ],
    },
    // {
    //   title: t('app.sidebar.menu.umrah'),
    //   url: "/accounts",
    //   icon: Users,
    //   items: [
    //     {
    //       title: t('app.allAccounts'),
    //       url: "/accounts",
    //     },
    //     {
    //       title: t('app.transactions'),
    //       url: "/accounts/transactions",
    //     },
    //     {
    //       title: t('app.reconciliation'),
    //       url: "/accounts/reconciliation",
    //     },
    //   ],
    // },
    // {
    //   title: t('app.invoices'),
    //   url: "/invoices",
    //   icon: Receipt,
    //   items: [
    //     {
    //       title: t('app.allInvoices'),
    //       url: "/invoices",
    //     },
    //     {
    //       title: t('app.createInvoice'),
    //       url: "/invoices/create",
    //     },
    //     {
    //       title: t('app.drafts'),
    //       url: "/invoices/drafts",
    //     },
    //   ],
    // },
    // {
    //   title: t('app.payments'),
    //   url: "/payments",
    //   icon: CreditCard,
    //   items: [
    //     {
    //       title: t('app.allPayments'),
    //       url: "/payments",
    //     },
    //     {
    //       title: t('app.pending'),
    //       url: "/payments/pending",
    //     },
    //     {
    //       title: t('app.history'),
    //       url: "/payments/history",
    //     },
    //   ],
    // },
    // {
    //   title: t('app.settings'),
    //   url: "/settings/profile",
    //   icon: Settings2,
    //   items: [
    //     {
    //       title: t('app.profile'),
    //       url: "/settings/profile",
    //     },
    //     {
    //       title: t('app.password'),
    //       url: "/settings/password",
    //     },
    //     {
    //       title: t('app.yearsManagement'),
    //       url: "/settings/years",
    //     },
    //     {
    //       title: t('app.appearance'),
    //       url: "/settings/appearance",
    //     },
    //   ],
    // },
  ];

  const accounts = [
    {
      title: t('app.sidebar.menu.sections'),
      url: "/sections/banks",
      icon: CreditCard,
      items: [
        {
          title: t('app.sidebar.options.banks'),
          url: "/sections/banks",
        },
        {
          title: t('app.sidebar.options.groupLeaders'),
          url: "/sections/group-leaders",
        },
        {
          title: t('app.sidebar.options.employees'),
          url: "/sections/employees",
        },
        {
          title: t('app.sidebar.options.bills'),
          url: "/sections/bills",
        },
        {
          title: t('app.sidebar.options.others'),
          url: "/sections/others",
        },
      ],
    },
  ];

  // const projects = [
  //   {
  //     name: t('app.companyAccounts'),
  //     url: "/projects/company",
  //     icon: Frame,
  //   },
  //   {
  //     name: t('app.taxPlanning'),
  //     url: "/projects/tax",
  //     icon: PieChart,
  //   },
  //   {
  //     name: t('app.budget2025'),
  //     url: "/projects/budget",
  //     icon: Map,
  //   },
  // ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} section={t('app.sidebar.section.platform')} />
        <NavMain items={management} section={t('app.sidebar.section.management')} />
        <NavMain items={accounts} section={t('app.sidebar.section.accounts')} />
        {/* <NavProjects projects={projects} /> */}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={displayUser} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
