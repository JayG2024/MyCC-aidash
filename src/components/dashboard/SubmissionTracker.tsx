import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Shield, Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface SubmissionStats {
  timeframe: 'today' | 'hour' | 'week';
  successful: number;
  failed: number;
  blocked: number;
  spam: number;
  total: number;
  successRate: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

interface FailedSubmission {
  formId: string;
  formTitle: string;
  timestamp: string;
  reason: 'validation_error' | 'server_error' | 'integration_failed' | 'spam_blocked' | 'captcha_failed';
  errorMessage: string;
  userLocation: string;
}

const SubmissionTracker: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'hour' | 'week'>('today');
  const [stats, setStats] = useState<SubmissionStats | null>(null);
  const [failedSubmissions, setFailedSubmissions] = useState<FailedSubmission[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  // Mock data generation
  useEffect(() => {
    const generateStats = (timeframe: 'today' | 'hour' | 'week'): SubmissionStats => {
      let baseSuccessful = 0;
      let baseFailed = 0;
      let baseBlocked = 0;
      let baseSpam = 0;

      switch (timeframe) {
        case 'hour':
          baseSuccessful = 45;
          baseFailed = 3;
          baseBlocked = 2;
          baseSpam = 1;
          break;
        case 'today':
          baseSuccessful = 856;
          baseFailed = 42;
          baseBlocked = 18;
          baseSpam = 24;
          break;
        case 'week':
          baseSuccessful = 6247;
          baseFailed = 312;
          baseBlocked = 158;
          baseSpam = 203;
          break;
      }

      const total = baseSuccessful + baseFailed + baseBlocked + baseSpam;
      const successRate = (baseSuccessful / total) * 100;
      
      return {
        timeframe,
        successful: baseSuccessful,
        failed: baseFailed,
        blocked: baseBlocked,
        spam: baseSpam,
        total,
        successRate,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        trendPercentage: Math.random() * 10 + 1
      };
    };

    const generateFailedSubmissions = (): FailedSubmission[] => {
      const forms = [
        { id: '68', title: 'Cyber Warrior Program Form' },
        { id: '62', title: 'Free Career Evaluation Form' },
        { id: '60', title: 'Request Information Form' },
        { id: '53', title: 'Skillbridge Form' },
        { id: '47', title: 'Social - Facebook Ad Form' }
      ];

      const reasons: FailedSubmission['reason'][] = [
        'validation_error', 'server_error', 'integration_failed', 'spam_blocked', 'captcha_failed'
      ];

      const errorMessages: Record<FailedSubmission['reason'], string[]> = {
        validation_error: ['Required field missing: Email', 'Invalid phone number format', 'Invalid email address'],
        server_error: ['Database connection timeout', 'Internal server error 500', 'Memory limit exceeded'],
        integration_failed: ['HubSpot API timeout', 'Email delivery failed', 'CRM sync error'],
        spam_blocked: ['High spam score detected', 'Suspicious IP address', 'Bot behavior pattern'],
        captcha_failed: ['reCAPTCHA verification failed', 'CAPTCHA timeout', 'Invalid CAPTCHA response']
      };

      return Array.from({ length: 15 }, (_, i) => {
        const form = forms[Math.floor(Math.random() * forms.length)];
        const reason = reasons[Math.floor(Math.random() * reasons.length)];
        const timestamp = new Date(Date.now() - i * 15 * 60 * 1000).toLocaleString();
        
        return {
          formId: form.id,
          formTitle: form.title,
          timestamp,
          reason,
          errorMessage: errorMessages[reason][Math.floor(Math.random() * errorMessages[reason].length)],
          userLocation: ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ'][Math.floor(Math.random() * 5)]
        };
      });
    };

    setStats(generateStats(selectedTimeframe));
    setFailedSubmissions(generateFailedSubmissions());
  }, [selectedTimeframe]);

  if (!stats) return <div>Loading...</div>;

  const getReasonIcon = (reason: FailedSubmission['reason']) => {
    switch (reason) {
      case 'validation_error': return <AlertTriangle size={16} className="text-yellow-600" />;
      case 'server_error': return <XCircle size={16} className="text-red-600" />;
      case 'integration_failed': return <AlertTriangle size={16} className="text-orange-600" />;
      case 'spam_blocked': return <Shield size={16} className="text-purple-600" />;
      case 'captcha_failed': return <Clock size={16} className="text-blue-600" />;
      default: return <AlertTriangle size={16} className="text-gray-600" />;
    }
  };

  const getReasonColor = (reason: FailedSubmission['reason']) => {
    switch (reason) {
      case 'validation_error': return 'bg-yellow-100 text-yellow-800';
      case 'server_error': return 'bg-red-100 text-red-800';
      case 'integration_failed': return 'bg-orange-100 text-orange-800';
      case 'spam_blocked': return 'bg-purple-100 text-purple-800';
      case 'captcha_failed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Form Submissions Overview</h3>
          <p className="text-sm text-gray-600">Real-time tracking of form submission success and failures</p>
        </div>
        
        <div className="flex space-x-2">
          {[
            { key: 'hour', label: 'Last Hour' },
            { key: 'today', label: 'Today' },
            { key: 'week', label: 'This Week' }
          ].map(period => (
            <button
              key={period.key}
              onClick={() => setSelectedTimeframe(period.key as any)}
              className={`px-3 py-1 text-sm rounded-lg ${
                selectedTimeframe === period.key
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle size={24} className="text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.successful.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Successful</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <XCircle size={24} className="text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.failed.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Failed</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Shield size={24} className="text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">{stats.blocked.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Blocked</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <AlertTriangle size={24} className="text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">{stats.spam.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Spam</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            {stats.trend === 'up' ? (
              <TrendingUp size={24} className="text-green-600" />
            ) : (
              <TrendingDown size={24} className="text-red-600" />
            )}
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.successRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Success Rate</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Submission Breakdown</span>
          <span>{stats.total.toLocaleString()} total submissions</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className="flex h-3 rounded-full overflow-hidden">
            <div 
              className="bg-green-500" 
              style={{ width: `${(stats.successful / stats.total) * 100}%` }}
            ></div>
            <div 
              className="bg-red-500" 
              style={{ width: `${(stats.failed / stats.total) * 100}%` }}
            ></div>
            <div 
              className="bg-purple-500" 
              style={{ width: `${(stats.blocked / stats.total) * 100}%` }}
            ></div>
            <div 
              className="bg-orange-500" 
              style={{ width: `${(stats.spam / stats.total) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Failed Submissions Summary */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-gray-900">Recent Failed Submissions</h4>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showDetails ? 'Hide Details' : 'View Details'}
          </button>
        </div>

        {showDetails && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {failedSubmissions.slice(0, 10).map((submission, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getReasonIcon(submission.reason)}
                  <div>
                    <div className="font-medium text-sm">{submission.formTitle}</div>
                    <div className="text-xs text-gray-600">{submission.errorMessage}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getReasonColor(submission.reason)}`}>
                    {submission.reason.replace('_', ' ').toUpperCase()}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">{submission.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!showDetails && stats.failed > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <AlertTriangle size={16} className="text-red-500 mr-2" />
              <span className="text-sm text-red-700">
                <strong>{stats.failed}</strong> submissions failed in the selected timeframe. 
                <button 
                  onClick={() => setShowDetails(true)}
                  className="ml-1 text-red-600 hover:text-red-800 underline"
                >
                  View details
                </button>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionTracker;