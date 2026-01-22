import * as React from "react"
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

export function AppSidebar({ ...props }) {
  const { user } = useAuth();
  const { t } = useTranslation();

  const displayUser = {
    name: user.attributes.name,
    email: user.attributes.email,
    avatar: user.attributes.avatar,
  };

  const navMain = [
    {
      title: t('app.dashboard'),
      url: "/dashboard",
      icon: LayoutDashboard,
      items: [],
    }
  ];

  const management = [
    {
      title: t('app.sidebar.options.hajj'),
      url: "/pilgrims",
      icon: BookOpen,
      items: [
        {
          title: t('app.sidebar.options.groupLeader'),
          url: "/group-leaders",
        },
        {
          title: t('app.sidebar.options.preRegistration'),
          url: "/pre-registrations",
        },
        {
          title: t('app.sidebar.options.registration'),
          url: "/registrations",
        },
        {
          title: t('app.sidebar.options.packages'),
          url: "/hajj-packages",
        },
      ],
    },
    {
      title: t('app.sidebar.options.umrah'),
      url: "/umrah",
      icon: GalleryVerticalEnd,
      items: [
        {
          title: t('app.sidebar.options.packages'),
          url: "/umrah-packages",
        },
        {
          title: t('app.sidebar.options.pilgrims'),
          url: "/umrah",
        },
      ],
    }
  ];

  const accounts = [
    {
      title: "Overview",
      url: "/accounts/overview",
      icon: AudioWaveform,
      items: [],
    },
    {
      title: t('app.sidebar.menu.sections'),
      url: "/accounts/sections/banks",
      icon: CreditCard,
      items: [
        {
          title: t('app.sidebar.options.banks'),
          url: "/accounts/sections/banks",
        },
        {
          title: t('app.sidebar.options.groupLeaders'),
          url: "/accounts/sections/group-leaders",
        },
        {
          title: 'Pre Registrations',
          url: "/accounts/sections/pre-registrations",
        },
        {
          title: 'Registrations',
          url: "/accounts/sections/registrations",
        },
        {
          title: t('app.sidebar.options.employees'),
          url: "/accounts/sections/employees",
        },
        {
          title: t('app.sidebar.options.lendings'),
          url: "/accounts/sections/lendings",
        },
        {
          title: t('app.sidebar.options.borrowings'),
          url: "/accounts/sections/borrowings",
        },
        {
          title: t('app.sidebar.options.bills'),
          url: "/accounts/sections/bills",
        },
        {
          title: t('app.sidebar.options.others'),
          url: "/accounts/sections/others",
        },
      ],
    },
    {
      title: t('app.sidebar.options.transactions'),
      url: "/accounts/transactions",
      icon: Receipt,
      items: [],
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
