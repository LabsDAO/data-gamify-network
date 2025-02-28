
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { useToast } from '@/hooks/use-toast';
import { 
  Database, 
  Upload, 
  HelpCircle, 
  CheckCircle, 
  Tag,
  Info,
  Building,
  CreditCard,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import GlassMorphismCard from '@/components/ui/GlassMorphismCard';

// Predefined categories
const categories = [
  'Environmental',
  'Automotive',
  'Wildlife',
  'Agriculture',
  'Disaster Response',
  'Medical',
  'Urban Planning',
  'Infrastructure',
  'Marine Conservation',
  'Other'
];

const RequestPage = () => {
  const navigate = useNavigate();
  const { authenticated, login } = usePrivy();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    organization: '',
    category: '',
    dataType: '',
    deadline: '',
    budget: '',
    contactEmail: '',
    customTags: '',
    termsAccepted: false
  });
  
  const [errorFields, setErrorFields] = useState<string[]>([]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Remove field from error list when user starts typing
    if (errorFields.includes(name)) {
      setErrorFields(errorFields.filter(field => field !== name));
    }
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
    
    if (errorFields.includes(name)) {
      setErrorFields(errorFields.filter(field => field !== name));
    }
  };
  
  const validateForm = () => {
    const requiredFields = ['title', 'description', 'organization', 'category', 'dataType', 'contactEmail'];
    const newErrorFields = requiredFields.filter(field => !formData[field]);
    
    if (!formData.termsAccepted) {
      newErrorFields.push('termsAccepted');
    }
    
    // Basic email validation
    if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrorFields.push('contactEmail');
    }
    
    setErrorFields(newErrorFields);
    return newErrorFields.length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authenticated) {
      login();
      return;
    }
    
    if (!validateForm()) {
      toast({
        title: "Please fix the errors",
        description: "Some required fields are missing or invalid",
        variant: "destructive"
      });
      return;
    }
    
    // Here you would normally submit the form data to your backend
    console.log('Form submitted:', formData);
    
    toast({
      title: "Challenge request submitted!",
      description: "We'll review your request and get back to you soon.",
      variant: "success"
    });
    
    // Redirect to contribute page after submission
    setTimeout(() => {
      navigate('/contribute');
    }, 2000);
  };
  
  return (
    <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Request Data Collection Challenge</h1>
          <p className="text-muted-foreground mt-2">
            Submit your organization's data collection needs
          </p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => navigate('/contribute')}
          className="flex items-center gap-2"
        >
          <Database className="w-4 h-4" />
          Back to Challenges
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Challenge Details</CardTitle>
              <CardDescription>
                Provide information about your data collection needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="requestForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className={errorFields.includes('title') ? 'text-destructive' : ''}>
                      Challenge Title*
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="E.g., Urban Tree Health Dataset"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={errorFields.includes('title') ? 'border-destructive' : ''}
                    />
                    {errorFields.includes('title') && (
                      <p className="text-destructive text-xs mt-1">Title is required</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className={errorFields.includes('description') ? 'text-destructive' : ''}>
                      Description*
                    </Label>
                    <textarea
                      id="description"
                      name="description"
                      placeholder="Describe your data collection needs in detail..."
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`flex h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errorFields.includes('description') ? 'border-destructive' : ''}`}
                    />
                    {errorFields.includes('description') && (
                      <p className="text-destructive text-xs mt-1">Description is required</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="organization" className={errorFields.includes('organization') ? 'text-destructive' : ''}>
                        Organization Name*
                      </Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="organization"
                          name="organization"
                          placeholder="Your organization"
                          value={formData.organization}
                          onChange={handleInputChange}
                          className={`pl-10 ${errorFields.includes('organization') ? 'border-destructive' : ''}`}
                        />
                      </div>
                      {errorFields.includes('organization') && (
                        <p className="text-destructive text-xs mt-1">Organization is required</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="category" className={errorFields.includes('category') ? 'text-destructive' : ''}>
                        Category*
                      </Label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errorFields.includes('category') ? 'border-destructive' : ''}`}
                      >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                      {errorFields.includes('category') && (
                        <p className="text-destructive text-xs mt-1">Category is required</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="dataType" className={errorFields.includes('dataType') ? 'text-destructive' : ''}>
                      Type of Data Needed*
                    </Label>
                    <Input
                      id="dataType"
                      name="dataType"
                      placeholder="E.g., Images of diseased trees, Audio recordings of bird calls"
                      value={formData.dataType}
                      onChange={handleInputChange}
                      className={errorFields.includes('dataType') ? 'border-destructive' : ''}
                    />
                    {errorFields.includes('dataType') && (
                      <p className="text-destructive text-xs mt-1">Data type is required</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="deadline">
                        Deadline (Optional)
                      </Label>
                      <Input
                        id="deadline"
                        name="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="budget">
                        Budget (Optional)
                      </Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="budget"
                          name="budget"
                          placeholder="Budget for data collection"
                          value={formData.budget}
                          onChange={handleInputChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="contactEmail" className={errorFields.includes('contactEmail') ? 'text-destructive' : ''}>
                      Contact Email*
                    </Label>
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      className={errorFields.includes('contactEmail') ? 'border-destructive' : ''}
                    />
                    {errorFields.includes('contactEmail') && (
                      <p className="text-destructive text-xs mt-1">Valid email is required</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="customTags">
                      Custom Tags (Optional)
                    </Label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="customTags"
                        name="customTags"
                        placeholder="Add comma-separated tags (e.g., urban, trees, AI)"
                        value={formData.customTags}
                        onChange={handleInputChange}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      These tags will help contributors find your challenge
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="termsAccepted"
                      name="termsAccepted"
                      checked={formData.termsAccepted}
                      onChange={handleCheckboxChange}
                      className={`h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary ${errorFields.includes('termsAccepted') ? 'border-destructive' : ''}`}
                    />
                    <Label 
                      htmlFor="termsAccepted"
                      className={`text-sm font-normal ${errorFields.includes('termsAccepted') ? 'text-destructive' : ''}`}
                    >
                      I agree to the terms and conditions for data collection*
                    </Label>
                  </div>
                  {errorFields.includes('termsAccepted') && (
                    <p className="text-destructive text-xs">You must agree to the terms</p>
                  )}
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit"
                form="requestForm"
                className="w-full"
              >
                Submit Challenge Request
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <div className="space-y-6">
            <GlassMorphismCard>
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-medium mb-2">How It Works</h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="bg-primary/20 text-primary h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                      <span>Submit your data collection request with details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-primary/20 text-primary h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                      <span>Our team reviews the request (1-2 business days)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-primary/20 text-primary h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                      <span>Challenge is published for contributors</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-primary/20 text-primary h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                      <span>You receive the collected data</span>
                    </li>
                  </ul>
                </div>
              </div>
            </GlassMorphismCard>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Access to a global network of contributors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Quality control and verification processes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Secure data storage and transfer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Custom labeling and annotation options</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  If you have questions about submitting a challenge request, our team is here to help.
                </p>
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestPage;
