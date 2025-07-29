'use client';

import React from 'react';
import Layout from '../../components/layout/Layout';
import StatsOverview from '../../components/features/StatsOverview';
import RecentlyPlayed from '../../components/features/RecentlyPlayed';
import PlaylistManager from '../../components/features/PlaylistManager';

export default function ProfilePage() {
  const userId = 'temp-user-id'; // Replace with actual user ID

  return (
    <Layout>
      <div className="profile-page p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-mauve to-lavender rounded-xl flex items-center justify-center">
            <i className="fas fa-user text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold">My Profile</h1>
            <p className="text-muted">Your music profile and stats</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PlaylistManager userId={userId} />
          </div>
          
          <div className="space-y-6">
            <StatsOverview userId={userId} />
            <RecentlyPlayed userId={userId} />
          </div>
        </div>
      </div>
    </Layout>
  );
}