import { Application } from '../models/application';

export const applications: Application[] = [
    {
        id: '5f9a0d75-847d-488f-85cd-57581d9c0dc6',
        name: 'Plan',
        icon: 'fa-solid fa-map-location-dot',
        applicationUrl: '/plan',
        category: 'Applications',
        groups: ['sadmin', 'admin', 'plan-editor', 'viewer']
    },
    {
        id: 'a426a915-2f6f-406d-bdbf-1d1cd6f6fe2e',
        name: 'Preferences',
        icon: 'fa-solid fa-sliders',
        applicationUrl: '/settings',
        category: 'Paramétrage',
        groups: ['sadmin', 'admin']
    }
];
