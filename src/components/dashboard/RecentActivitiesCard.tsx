import React from 'react';

interface Activity {
  id: string;
  title: string;
  type: string;
  timestamp: Date;
  user: {
    name: string;
    avatar?: string;
  };
}

interface RecentActivitiesCardProps {
  activities: Activity[];
}

const RecentActivitiesCard: React.FC<RecentActivitiesCardProps> = ({ activities }) => {
  const formatTime = (date: Date) => {
    const diffInMinutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
    return `${diffInMinutes} minutes ago`;
  };

  const getActivityTypeColor = (type: string) => {
    switch(type) {
      case 'content':
        return 'bg-purple-100 text-purple-600';
      case 'lead':
        return 'bg-green-100 text-green-600';
      case 'report':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-lg text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-32 -translate-y-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full transform -translate-x-24 translate-y-24"></div>
      
      <h3 className="text-xl font-bold text-white mb-4 relative z-10">Recent Activities</h3>
      
      <div className="space-y-5 relative z-10">
        {activities.map(activity => (
          <div key={activity.id} className="flex items-start backdrop-blur-sm bg-white/10 rounded-lg p-3 border border-white/10 hover:bg-white/20 transition-colors">
            {activity.user.avatar ? (
              <img 
                src={activity.user.avatar} 
                alt={activity.user.name} 
                className="w-10 h-10 rounded-full mr-3 border-2 border-white/20"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3 border-2 border-white/20">
                <span className="text-white font-medium">
                  {activity.user.name.charAt(0)}
                </span>
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <p className="font-medium text-white">
                  {activity.user.name}
                </p>
                <span className="text-gray-300 text-sm ml-2">
                  {formatTime(activity.timestamp)}
                </span>
              </div>
              
              <p className="text-gray-200">{activity.title}</p>
              
              <span className={`text-xs px-2.5 py-1 rounded-full mt-2 inline-block ${getActivityTypeColor(activity.type)}`}>
                {activity.type}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {activities.length > 5 && (
        <button className="w-full mt-5 py-2.5 text-center bg-white/10 backdrop-blur-sm rounded-lg text-white font-medium hover:bg-white/20 transition-colors border border-white/10">
          View all activities
        </button>
      )}
    </div>
  );
};

export default RecentActivitiesCard;