/**
 * DepartmentSettingsPage
 * 
 * Staff view for managing department-specific settings.
 * Allows configuration of department policies, defaults, and preferences.
 * 
 * Path: /staff/departments/:deptId/settings
 * 
 * Features:
 * - Department profile management (name, code, description)
 * - Default enrollment settings
 * - Notification preferences
 * - Access control settings
 * - Integration configuration
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronRight,
  Building,
  Settings,
  Bell,
  Shield,
  Users,
  Save,
  RefreshCw,
  Info,
} from 'lucide-react';
import {
  Button,
  Input,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Label,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';
import { useDepartment } from '@/entities/department/model/useDepartment';
import { useDepartmentContext } from '@/shared/hooks';

export function DepartmentSettingsPage() {
  const { deptId } = useParams<{ deptId: string }>();
  const { 
    hasPermission, 
    switchDepartment, 
    currentDepartmentId,
    isSwitching 
  } = useDepartmentContext();

  // Switch to the department from the URL if needed
  useEffect(() => {
    if (deptId && deptId !== currentDepartmentId) {
      switchDepartment(deptId);
    }
  }, [deptId, currentDepartmentId, switchDepartment]);

  // Fetch department details
  const { 
    data: department, 
    isLoading: isDeptLoading, 
    error: deptError 
  } = useDepartment(deptId || '');
  
  // Tab state
  const [activeTab, setActiveTab] = useState('general');
  
  // Form state (would be managed by a form library in production)
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Permission checks
  const canViewSettings = hasPermission('settings:view-department');
  const canManageSettings = hasPermission('settings:manage-department');

  // Loading state
  if (isDeptLoading || isSwitching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading department...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (deptError || !department) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Department Not Found</CardTitle>
            <CardDescription>
              The department you're looking for doesn't exist or you don't have permission to view it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/staff/dashboard">
              <Button variant="outline">Return to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Permission denied
  if (!canViewSettings) {
    return (
      <div className="p-6">
        <Card className="border-yellow-500">
          <CardHeader>
            <CardTitle className="text-yellow-700">Access Restricted</CardTitle>
            <CardDescription>
              You don't have permission to view settings for this department.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/staff/dashboard">
              <Button variant="outline">Return to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Implement save functionality
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setHasChanges(false);
  };

  const handleChange = () => {
    if (canManageSettings) {
      setHasChanges(true);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/staff/dashboard" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/staff/departments" className="hover:text-foreground transition-colors">
          Departments
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link 
          to={`/staff/departments/${deptId}/overview`} 
          className="hover:text-foreground transition-colors"
        >
          {department.name}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">Settings</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{department.name} Settings</h1>
            <Badge variant="secondary" className="font-mono">
              <Building className="h-3 w-3 mr-1" />
              {department.code}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Configure department settings and preferences
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {hasChanges && canManageSettings && (
            <>
              <Button variant="outline" onClick={() => setHasChanges(false)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Discard
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Read-only notice */}
      {!canManageSettings && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 flex items-center gap-3">
            <Info className="h-5 w-5 text-blue-600" />
            <p className="text-sm text-blue-800">
              You have view-only access to these settings. Contact a department administrator to make changes.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="enrollment">
            <Users className="h-4 w-4 mr-2" />
            Enrollment
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="access">
            <Shield className="h-4 w-4 mr-2" />
            Access
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Department Profile</CardTitle>
              <CardDescription>
                Basic information about this department
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Department Name</Label>
                  <Input 
                    id="name" 
                    defaultValue={department.name}
                    disabled={!canManageSettings}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Department Code</Label>
                  <Input 
                    id="code" 
                    defaultValue={department.code}
                    disabled={!canManageSettings}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input 
                  id="description" 
                  defaultValue={department.description || ''}
                  disabled={!canManageSettings}
                  onChange={handleChange}
                  placeholder="Enter department description"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Department Status</CardTitle>
              <CardDescription>
                Control the visibility and availability of this department
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Active Status</Label>
                  <p className="text-sm text-muted-foreground">
                    When disabled, the department will be hidden from learners
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="active-status"
                    defaultChecked={department.status === 'active'}
                    disabled={!canManageSettings}
                    onCheckedChange={handleChange}
                  />
                  <Label htmlFor="active-status" className="text-sm">
                    {department.status === 'active' ? 'Active' : 'Inactive'}
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enrollment Settings */}
        <TabsContent value="enrollment" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Default Enrollment Settings</CardTitle>
              <CardDescription>
                Configure default settings for new enrollments in this department
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-enroll in Prerequisites</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically enroll students in required prerequisite courses
                  </p>
                </div>
                <Checkbox 
                  disabled={!canManageSettings}
                  onCheckedChange={handleChange}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Manager Approval</Label>
                  <p className="text-sm text-muted-foreground">
                    Enrollments require approval from a manager
                  </p>
                </div>
                <Checkbox 
                  disabled={!canManageSettings}
                  onCheckedChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry">Default Enrollment Duration</Label>
                <Select disabled={!canManageSettings} onValueChange={() => handleChange()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">6 months</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                    <SelectItem value="none">No expiration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Capacity Limits</CardTitle>
              <CardDescription>
                Set enrollment capacity defaults for classes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxClassSize">Default Maximum Class Size</Label>
                  <Input 
                    id="maxClassSize" 
                    type="number"
                    placeholder="30"
                    disabled={!canManageSettings}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waitlistSize">Default Waitlist Size</Label>
                  <Input 
                    id="waitlistSize" 
                    type="number"
                    placeholder="10"
                    disabled={!canManageSettings}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Email Notifications</CardTitle>
              <CardDescription>
                Configure automatic email notifications for department events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Enrollment Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify instructors when a student enrolls in their class
                  </p>
                </div>
                <Checkbox 
                  defaultChecked
                  disabled={!canManageSettings}
                  onCheckedChange={handleChange}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Course Completion Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify managers when students complete courses
                  </p>
                </div>
                <Checkbox 
                  defaultChecked
                  disabled={!canManageSettings}
                  onCheckedChange={handleChange}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Deadline Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Send reminders before enrollment deadlines
                  </p>
                </div>
                <Checkbox 
                  defaultChecked
                  disabled={!canManageSettings}
                  onCheckedChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification Recipients</CardTitle>
              <CardDescription>
                Configure additional notification recipients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminEmails">Admin Email Addresses</Label>
                <Input 
                  id="adminEmails" 
                  placeholder="Enter comma-separated email addresses"
                  disabled={!canManageSettings}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground">
                  These addresses will receive copies of important notifications
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Settings */}
        <TabsContent value="access" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Default Permissions</CardTitle>
              <CardDescription>
                Configure default access levels for new users in this department
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultRole">Default Role for New Staff</Label>
                <Select disabled={!canManageSettings} onValueChange={() => handleChange()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="instructor">Instructor</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Self-Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to request access to this department
                  </p>
                </div>
                <Checkbox 
                  disabled={!canManageSettings}
                  onCheckedChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Content Visibility</CardTitle>
              <CardDescription>
                Control who can view department content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Public Course Catalog</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow non-enrolled users to browse course information
                  </p>
                </div>
                <Checkbox 
                  defaultChecked
                  disabled={!canManageSettings}
                  onCheckedChange={handleChange}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cross-Department Visibility</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow staff from other departments to view courses
                  </p>
                </div>
                <Checkbox 
                  disabled={!canManageSettings}
                  onCheckedChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
export default DepartmentSettingsPage;
