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
    avatar: "",
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
      title: t('app.sidebar.options.groupLeader'),
      url: "/group-leaders",
      icon: Users,
      items: [],
    },
    {
      title: "Hajj",
      url: "/pilgrims",
      icon: BookOpen,
      items: [
        {
          title: t('app.sidebar.options.preRegistration'),
          url: "/pre-registrations",
        },
        {
          title: t('app.sidebar.options.registration'),
          url: "/registrations",
        },
        {
          title: "Packages",
          url: "/hajj-packages",
        },
      ],
    },
    {
      title: "Umrah",
      url: "/umrah",
      icon: GalleryVerticalEnd,
      items: [
        {
          title: "Pilgrims",
          url: "/umrah",
        },
        {
          title: "Packages",
          url: "/umrah-packages",
        }
      ],
    }
  ];

  const accounts = [
    {
      title: t('app.sidebar.menu.sections'),
      url: "/sections",
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
    {
      title: "Loans",
      url: "/sections/lendings",
      icon: Wallet,
      items: [
        {
          title: t('app.sidebar.options.lendings'),
          url: "/sections/lendings",
        },
        {
          title: t('app.sidebar.options.borrowings'),
          url: "/sections/borrowings",
        }
      ],
    },
    {
      title: "Transactions",
      url: "/transactions",
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
