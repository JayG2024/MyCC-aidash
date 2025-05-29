import React from 'react';
import { TrendingUp, DollarSign, Users } from 'lucide-react';

const ExampleInsights: React.FC = () => {
  return (
    <div className="rounded-xl p-6 bg-gray-900 border border-gray-800 shadow-sm text-gray-300">
      <h3 className="text-xl font-bold text-blue-400 mb-4">Example Business Insights</h3>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg text-blue-400 mb-2">Executive Summary</h2>
          <p className="mb-2">Based on analysis of your Q2 sales data, we've identified the following key insights:</p>
          
          <ul className="space-y-2 list-inside">
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <div>
                <span className="text-blue-400 font-medium">Revenue Growth:</span> 23% increase in overall sales compared to Q1, with strongest performance in enterprise segment
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <div>
                <span className="text-blue-400 font-medium">Product Performance:</span> Premium subscription tier shows 37% higher retention than basic tier
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <div>
                <span className="text-blue-400 font-medium">Regional Insights:</span> Northeast region outperforming other territories by 18% in conversion rate
              </div>
            </li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg text-blue-400 mb-2">Sales Performance by Product Category</h3>
          
          <div className="bg-gray-800 rounded overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr className="bg-gray-750">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Product Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Growth</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Profit Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-200">Enterprise Solutions</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-300">$1,245,000</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-green-400">+32.5%</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-300">42.8%</td>
                </tr>
                <tr>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-200">SMB Packages</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-300">$875,200</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-green-400">+17.8%</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-300">38.2%</td>
                </tr>
                <tr>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-200">Consumer Subscriptions</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-300">$543,800</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-red-400">-3.2%</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-300">52.1%</td>
                </tr>
                <tr className="bg-gray-750">
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-200">Total</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-bold text-gray-200">$2,664,000</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-bold text-green-400">+23.1%</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-bold text-gray-200">43.6%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg text-blue-400 mb-2">Marketing Channel Effectiveness</h3>
          
          <div className="bg-gray-800 rounded overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr className="bg-gray-750">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Channel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Leads</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-200">Paid Search</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-300">1,240</td>
                </tr>
                <tr>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-200">LinkedIn</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-300">825</td>
                </tr>
                <tr>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-200">Referral</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-300">312</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg text-blue-400 mb-2">Recommendations</h3>
          <ol className="space-y-2 list-decimal list-inside ml-4">
            <li>
              <span className="text-blue-400 font-medium">Increase investment in referral programs</span> - 
              highest conversion rate and lowest customer acquisition cost
            </li>
            <li>
              <span className="text-blue-400 font-medium">Review Consumer Subscription positioning</span> - 
              only category showing decline despite high margins
            </li>
            <li>
              <span className="text-blue-400 font-medium">Expand Northeast sales team capacity</span> to 
              capitalize on higher regional performance
            </li>
          </ol>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="p-3 bg-blue-900/30 rounded-lg flex items-center">
            <div>
              <div className="text-xl font-bold text-blue-300">+23%</div>
              <div className="text-xs text-blue-400">Revenue Growth</div>
            </div>
          </div>
          
          <div className="p-3 bg-green-900/30 rounded-lg flex items-center">
            <div>
              <div className="text-xl font-bold text-green-300">43.6%</div>
              <div className="text-xs text-green-400">Profit Margin</div>
            </div>
          </div>
          
          <div className="p-3 bg-purple-900/30 rounded-lg flex items-center">
            <div>
              <div className="text-xl font-bold text-purple-300">5.4%</div>
              <div className="text-xs text-purple-400">Conversion Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExampleInsights;