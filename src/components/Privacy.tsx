import React from 'react';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Privacy: React.FC = () => {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-orange max-w-none">
          <p className="text-gray-600 mb-6">
            Last Updated: June 15, 2025
          </p>
          
          <h2>1. Introduction</h2>
          <p>
            This Privacy Policy explains how Bus Timetable Generator ("we," "us," or "our") collects, uses, and shares your personal information 
            when you use our website and services (collectively, the "Service").
          </p>
          
          <h2>2. Information We Collect</h2>
          
          <h3>2.1 Information You Provide to Us</h3>
          <p>We collect information you provide directly to us when you:</p>
          <ul>
            <li>Create an account (email address, password)</li>
            <li>Use our services (project names, timetable data)</li>
            <li>Contact customer support</li>
            <li>Respond to surveys or communications</li>
          </ul>
          
          <h3>2.2 Information We Collect Automatically</h3>
          <p>When you use our Service, we automatically collect certain information, including:</p>
          <ul>
            <li>Log information (IP address, browser type, pages visited, time spent)</li>
            <li>Device information (hardware model, operating system, unique device identifiers)</li>
            <li>Usage data (features used, projects created, actions taken)</li>
          </ul>
          
          <h3>2.3 Information from Third Parties</h3>
          <p>
            If you choose to sign in using Google authentication, we receive your email address and profile information from Google, 
            subject to your Google account privacy settings.
          </p>
          
          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our Service</li>
            <li>Process transactions and send related information</li>
            <li>Send technical notices, updates, security alerts, and administrative messages</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Communicate with you about products, services, and events</li>
            <li>Monitor and analyze trends, usage, and activities in connection with our Service</li>
            <li>Detect, investigate, and prevent security incidents</li>
          </ul>
          
          <h2>4. How We Share Your Information</h2>
          <p>We may share your information in the following circumstances:</p>
          <ul>
            <li>With vendors, service providers, and consultants who need access to perform work for us</li>
            <li>In response to a legal request if we believe disclosure is required by law</li>
            <li>To protect the rights, property, and safety of our users or others</li>
            <li>In connection with a business transfer (merger, acquisition, reorganization)</li>
            <li>With your consent or at your direction</li>
          </ul>
          
          <h2>5. Data Security</h2>
          <p>
            We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, 
            disclosure, alteration, and destruction. However, no security system is impenetrable, and we cannot guarantee the security 
            of our systems.
          </p>
          
          <h2>6. Data Retention</h2>
          <p>
            We will retain your information for as long as your account is active or as needed to provide you with the Service. 
            We will also retain and use your information as necessary to comply with our legal obligations, resolve disputes, and 
            enforce our agreements.
          </p>
          
          <h2>7. Your Choices</h2>
          <p>You can exercise certain choices regarding your information:</p>
          <ul>
            <li>Account Information: You can update your account information through your account settings</li>
            <li>Cookies: Most web browsers allow you to manage your cookie preferences</li>
            <li>Marketing Communications: You can opt out of marketing emails by following the unsubscribe instructions</li>
            <li>Data Access and Deletion: Contact us to request access to, correction of, or deletion of your information</li>
          </ul>
          
          <h2>8. Children's Privacy</h2>
          <p>
            The Service is not directed to children under the age of 13, and we do not knowingly collect personal information from 
            children under 13. If you believe we have collected information from a child under 13, please contact us.
          </p>
          
          <h2>9. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than the country in which you reside. These 
            countries may have data protection laws that are different from the laws of your country.
          </p>
          
          <h2>10. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new 
            Privacy Policy on this page and, where appropriate, by email.
          </p>
          
          <h2>11. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at privacy@bustimetablegenerator.com.
          </p>
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