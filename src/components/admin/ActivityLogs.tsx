
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useActivityLogs } from '@/hooks/useAdmin';
import { Activity, User, Heart, Calendar, Settings as SettingsIcon } from 'lucide-react';

const ActivityLogs = () => {
  const { data: logs, isLoading } = useActivityLogs();

  const getActionIcon = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case 'user_action':
        return <User className="w-4 h-4" />;
      case 'escort_action':
        return <Heart className="w-4 h-4" />;
      case 'booking_action':
        return <Calendar className="w-4 h-4" />;
      case 'settings_change':
        return <SettingsIcon className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case 'user_action':
        return 'bg-blue-500';
      case 'escort_action':
        return 'bg-purple-500';
      case 'booking_action':
        return 'bg-green-500';
      case 'settings_change':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Activity Logs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse border-l-4 border-gray-200 pl-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : logs && logs.length > 0 ? (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className={`border-l-4 ${getActionColor(log.action_type)} pl-4 py-3`}>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className={`${getActionColor(log.action_type)} text-white`}>
                        {getActionIcon(log.action_type)}
                        <span className="ml-1">{log.action_type.replace('_', ' ')}</span>
                      </Badge>
                      <Badge variant="outline">{log.target_type}</Badge>
                    </div>
                    <p className="text-sm font-medium">{log.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                    {log.metadata && (
                      <details className="text-xs text-gray-600">
                        <summary className="cursor-pointer hover:text-gray-800">
                          View metadata
                        </summary>
                        <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No activity logs found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityLogs;
