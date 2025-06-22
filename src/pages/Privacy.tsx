
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We collect information you provide directly to us when you create an account, 
                use our services, or communicate with us. This includes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Personal information such as name, email address, and phone number</li>
                <li>Profile information including photos, bio, and service preferences</li>
                <li>Payment information for transaction processing</li>
                <li>Communication data including messages and support requests</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices, updates, and support messages</li>
                <li>Respond to your comments, questions, and customer service requests</li>
                <li>Communicate about promotions, events, and other news</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Information Sharing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We do not sell, trade, or otherwise transfer your personal information to third parties 
                without your consent, except as described in this policy:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>With service providers who assist us in operating our platform</li>
                <li>When required by law or to protect our rights and safety</li>
                <li>In connection with a business transfer or acquisition</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We implement appropriate security measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. However, 
                no method of transmission over the internet is 100% secure.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy, please contact us at:
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

export default Privacy;
