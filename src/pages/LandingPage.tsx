import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { submitToGoogleSheets } from '@/utils/googleSheets';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
  organizationSize: z.string(),
  email: z.string().email('Invalid email address'),
});

type FormData = z.infer<typeof formSchema>;

export function LandingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      organizationName: '',
      organizationSize: '',
      email: '',
    },
  });

  async function onSubmit(data: FormData) {
    setIsSubmitting(true);
    try {
      const accessToken = import.meta.env.VITE_GOOGLE_SHEETS_ACCESS_TOKEN;
      if (!accessToken) {
        throw new Error('Google Sheets access token not configured');
      }

      await submitToGoogleSheets(data, accessToken);
      toast.success('Information submitted successfully!');
      navigate('/template-creation');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Your AI-Powered Template
          </h1>
          <p className="text-xl text-gray-600">
            Get started by providing your information below
          </p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
            <CardDescription>
              Please fill in your details to create your template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  {...form.register('name')}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizationName">Organization Name</Label>
                <Input
                  id="organizationName"
                  placeholder="Acme Inc."
                  {...form.register('organizationName')}
                />
                {form.formState.errors.organizationName && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.organizationName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizationSize">Organization Size</Label>
                <Select
                  onValueChange={(value) => form.setValue('organizationSize', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="501+">501+ employees</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.organizationSize && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.organizationSize.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Template...' : 'Create Template'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 