// Menu configuration for default layout
const menuItems = {
  items: [
    {
      id: 'navigation',
      title: 'Navigation',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          type: 'item', // Mengubah dari 'collapse' menjadi 'item' agar langsung diklik
          url: '/dashboard/sales', // URL default dashboard
          icon: 'ph-gauge',
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'auth',
      title: 'Authentication',
      type: 'group',
      icon: 'icon-pages',
      children: [
        {
          id: 'login',
          title: 'Login',
          type: 'item',
          url: '/login',
          icon: 'ph-lock-key',
          target: true // Membuka di halaman penuh (biasanya perilaku login)
        }
      ]
    }
  ]
};

export default menuItems;