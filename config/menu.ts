export interface NavItem {
    title: string
    icon: string
    url?: string
    isActive?: boolean
    items?: NavItem[]
}

export interface NavGroup {
    title: string
    items: NavItem[]
}

const menu: NavGroup[] = [
    {
        title: '포트폴리오',
        items: [
            {
                title: '메인',
                icon: 'Home',
                url: '/dashboard'
            },
            {
                title: '소개',
                icon: 'UserRound',
                url: '/dashboard/biography'
            },
            {
                title: '링크',
                icon: 'Link',
                url: '/dashboard/link'
            },
            {
                title: '기술 스택',
                icon: 'CodeXml',
                url: '/dashboard/skill'
            },
            {
                title: '프로젝트',
                icon: 'FolderOpen',
                url: '/dashboard/project'
            },
        ],
    },
    {
        title: '관리자',
        items: [
            {
                title: '기술 스택 관리',
                icon: 'CodeXml',
                url: '/dashboard/admin/skill'
            },
            {
                title: '사용자 관리',
                icon: 'UsersRound',
                url: '/dashboard/admin/user'
            },
        ],
    },
];

export default menu;