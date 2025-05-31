import React from 'react';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link to="/" className="flex items-center mr-6">
              <ArrowLeft size={20} className="mr-2" />
              <span className="text-gray-600">Back</span>
            </Link>
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-500 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">Bus Timetable Generator</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="prose prose-orange max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Bus Timetable Generator service ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
            If you do not agree to these Terms, you may not access or use the Service.
          </p>
          
          <h2>2. Description of Service</h2>
          <p>
            The Service provides tools for creating, managing, and printing bus timetables based on public transportation data.
            We reserve the right to modify, suspend, or discontinue the Service at any time without notice.
          </p>
          
          <h2>3. User Accounts</h2>
          <p>
            To access certain features of the Service, you must register for an account. You are responsible for maintaining the 
            confidentiality of your account information and for all activities that occur under your account. You agree to notify us 
            immediately of any unauthorized use of your account.
          </p>
          
          <h2>4. User Content</h2>
          <p>
            You retain all ownership rights to any content you create using the Service. By uploading or creating content, you grant us a 
            non-exclusive, royalty-free license to use, store, and display your content in connection with providing the Service to you.
          </p>
          
          <h2>5. Free and Paid Features</h2>
          <p>
            The Service offers both free and paid features. Free accounts are limited to one project with up to three timetables. 
            We reserve the right to change the limitations of free accounts at any time.
          </p>
          
          <h2>6. Prohibited Activities</h2>
          <p>
            You agree not to:
          </p>
          <ul>
            <li>Use the Service for any illegal purpose</li>
            <li>Attempt to gain unauthorized access to the Service or its systems</li>
            <li>Interfere with other users' access to the Service</li>
            <li>Circumvent any limitations imposed on your account</li>
            <li>Reverse engineer or attempt to extract the source code of the Service</li>
          </ul>
          
          <h2>7. Third-Party Services and Data</h2>
          <p>
            The Service relies on third-party transportation data providers. We are not responsible for the accuracy, availability, 
            or reliability of this data. Your use of any third-party services through our Service is subject to their respective terms.
          </p>
          
          <h2>8. Disclaimer of Warranties</h2>
          <p>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. 
            WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
          </p>
          
          <h2>9. Limitation of Liability</h2>
          <p>
            TO THE FULLEST EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, 
            OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUE, RESULTING FROM YOUR USE OF THE SERVICE.
          </p>
          
          <h2>10. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will provide notice of significant changes by posting the updated 
            Terms on the Service. Your continued use of the Service after such changes constitutes your acceptance of the new Terms.
          </p>
          
          <h2>11. Termination</h2>
          <p>
            We may terminate or suspend your account and access to the Service at any time, without prior notice or liability, for any 
            reason, including if you breach these Terms.
          </p>
          
          <h2>12. Governing Law</h2>
          <p>
            These Terms shall be governed by the laws of the jurisdiction in which we operate, without regard to its conflict of law provisions.
          </p>
          
          <h2>13. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us at support@bustimetablegenerator.com.
          </p>
          
          <p className="text-sm text-gray-500 mt-8">Last updated: June 15, 2025</p>
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Bus Timetable Generator. All rights reserved.</p>
            <p className="mt-2">
              <Link to="/terms" className="text-orange-600 hover:text-orange-700">Terms of Service</Link> • 
              <Link to="/privacy" className="text-orange-600 hover:text-orange-700 ml-3">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};