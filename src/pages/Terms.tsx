
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                By accessing and using EldoVibes, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, 
                please do not use this service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                EldoVibes is a platform that connects users with professional companion services. 
                Our services include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Profile browsing and search functionality</li>
                <li>Secure messaging and communication tools</li>
                <li>Booking and scheduling services</li>
                <li>Payment processing for legitimate companion services</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">Users are responsible for:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Providing accurate and truthful information</li>
                <li>Maintaining the confidentiality of account credentials</li>
                <li>Using the service in compliance with all applicable laws</li>
                <li>Respecting other users and maintaining professional conduct</li>
                <li>Reporting any inappropriate behavior or content</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prohibited Activities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">The following activities are strictly prohibited:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Any illegal activities or services</li>
                <li>Harassment, abuse, or threatening behavior</li>
                <li>Sharing false or misleading information</li>
                <li>Attempting to circumvent our security measures</li>
                <li>Spamming or unsolicited communications</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment and Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Users may be charged fees for certain services. All payments are processed securely, 
                and fees are non-refundable except as required by law. We reserve the right to 
                modify our fee structure with reasonable notice.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Termination</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We reserve the right to terminate or suspend accounts that violate these terms 
                or engage in inappropriate behavior. Users may also terminate their accounts 
                at any time by contacting our support team.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                For questions about these Terms of Service, please contact us at:
                <br />
                Email: eldovibes@gmail.com
                <br />
                Phone: 0716 491 128
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;
