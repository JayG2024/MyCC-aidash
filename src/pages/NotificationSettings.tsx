import React from 'react';
import Layout from '../components/layout/Layout';
import NotificationSettings from '../components/forms/NotificationSettings';

const NotificationSettingsPage: React.FC = () => {
  return (
    <Layout title="Notification Settings">
      <NotificationSettings />
    </Layout>
  );
};

export default NotificationSettingsPage;