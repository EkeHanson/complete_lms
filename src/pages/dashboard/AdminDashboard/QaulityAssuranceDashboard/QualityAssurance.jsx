import React from 'react';
import { 
  Tabs, 
  Tab, 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { 
  ExpandMore, 
  Dashboard, 
  Checklist, 
  Assignment, 
  Schedule,
  People,
  VerifiedUser,
  Description,
  Feedback
} from '@mui/icons-material';
import QualityDashboard from './QualityDashboard';
import IQASampleList from './IQASampleList';
import EQAVisitList from './EQAVisitList';
import IQASamplingPlanList from './IQASamplingPlanList';

const QualityAssuranceDocumentation = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" gutterBottom>
        Quality Assurance System Documentation
      </Typography>
      
      <Tabs defaultValue="overview" sx={{ mb: 3 }}>
        <Tab value="overview" label="Overview" icon={<Dashboard />} />
        <Tab value="iqa" label="IQA Process" icon={<Checklist />} />
        <Tab value="eqa" label="EQA Process" icon={<VerifiedUser />} />
        <Tab value="roles" label="User Roles" icon={<People />} />
        <Tab value="system" label="System Interface" icon={<Assignment />} />
      </Tabs>

      {/* Overview Section */}
      <Box id="overview" sx={{ mb: 5 }}>
        <Typography variant="h4" gutterBottom>
          System Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                height="240"
                image="https://img.freepik.com/free-vector/quality-control-concept-illustration_114360-1904.jpg"
                alt="Quality Assurance Overview"
              />
              <CardContent>
                <Typography variant="h5">IQA & EQA Workflow</Typography>
                <Typography>
                  The Quality Assurance system has two main components:
                </Typography>
                <ul>
                  <li><strong>IQA (Internal Quality Assurance)</strong>: For internal staff to verify assessments</li>
                  <li><strong>EQA (External Quality Assurance)</strong>: For external auditors to review compliance</li>
                </ul>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                height="240"
                image="https://img.freepik.com/free-vector/business-team-putting-together-jigsaw-puzzle-isolated-flat-vector-illustration-cartoon-partners-working-connection-teamwork-partnership-cooperation-concept_74855-9814.jpg"
                alt="Team Collaboration"
              />
              <CardContent>
                <Typography variant="h5">Key Benefits</Typography>
                <ul>
                  <li>Standardized assessment verification</li>
                  <li>Clear audit trails for compliance</li>
                  <li>Improved feedback mechanisms</li>
                  <li>Automated documentation</li>
                  <li>Real-time quality monitoring</li>
                </ul>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* IQA Process Section */}
      <Box id="iqa" sx={{ mb: 5 }}>
        <Typography variant="h4" gutterBottom>
          IQA Process Workflow
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image="https://img.freepik.com/free-vector/business-planning-process-concept-illustration_114360-1676.jpg"
                alt="Sampling Plan"
              />
              <CardContent>
                <Typography variant="h6">1. Create Sampling Plan</Typography>
                <Typography>
                  Define how many assessments to review and criteria
                </Typography>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography>How to use</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ol>
                      <li>Go to <strong>Quality Assurance → Sampling Plans</strong></li>
                      <li>Click <strong>"Create Sampling Plan"</strong></li>
                      <li>Fill in qualification, date range, sample size, and criteria</li>
                      <li>Save the plan</li>
                    </ol>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image="https://img.freepik.com/free-vector/quality-control-concept-illustration_114360-1821.jpg"
                alt="Review Assessments"
              />
              <CardContent>
                <Typography variant="h6">2. Review Assessments</Typography>
                <Typography>
                  Verify assessment quality and consistency
                </Typography>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography>How to use</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ol>
                      <li>Go to <strong>Quality Assurance → IQA Samples</strong></li>
                      <li>Select an assessment from the list</li>
                      <li>Review evidence and assessor feedback</li>
                      <li>Choose a decision (Approved/Revisions/Invalid)</li>
                    </ol>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image="https://img.freepik.com/free-vector/business-feedback-concept-illustration_114360-2134.jpg"
                alt="Provide Feedback"
              />
              <CardContent>
                <Typography variant="h6">3. Provide Feedback</Typography>
                <Typography>
                  Help assessors improve their assessment quality
                </Typography>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography>How to use</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ol>
                      <li>In the IQA Sample form, fill in <strong>"Feedback to Assessor"</strong></li>
                      <li>Be specific about required improvements</li>
                      <li>Assessors receive notifications automatically</li>
                    </ol>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* EQA Process Section */}
      <Box id="eqa" sx={{ mb: 5 }}>
        <Typography variant="h4" gutterBottom>
          EQA Process Workflow
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image="https://img.freepik.com/free-vector/appointment-booking-with-calendar_23-2148552952.jpg"
                alt="Schedule Visit"
              />
              <CardContent>
                <Typography variant="h6">1. Schedule EQA Visit</Typography>
                <Typography>
                  Plan audits with external verifiers
                </Typography>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography>How to use</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ol>
                      <li>Go to <strong>Quality Assurance → EQA Visits</strong></li>
                      <li>Click <strong>"Schedule EQA Visit"</strong></li>
                      <li>Fill in visit details (date, type, auditor, agenda)</li>
                      <li>Save the visit record</li>
                    </ol>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image="https://img.freepik.com/free-vector/audit-concept-illustration_114360-2183.jpg"
                alt="Conduct Sampling"
              />
              <CardContent>
                <Typography variant="h6">2. Conduct Sampling</Typography>
                <Typography>
                  Review IQA work and learner assessments
                </Typography>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography>How to use</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ol>
                      <li>During the visit, go to <strong>EQA Samples</strong></li>
                      <li>Select assessments to review (read-only access)</li>
                      <li>Check learner portfolios and IQA records</li>
                      <li>Record findings (Satisfactory/Action Required/Unsatisfactory)</li>
                    </ol>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image="https://img.freepik.com/free-vector/business-report-concept-illustration_114360-1525.jpg"
                alt="Generate Reports"
              />
              <CardContent>
                <Typography variant="h6">3. Generate Reports</Typography>
                <Typography>
                  Document audit results for compliance
                </Typography>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography>How to use</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ol>
                      <li>After the visit, upload the <strong>EQA Report</strong></li>
                      <li>Add follow-up notes if actions are needed</li>
                      <li>System automatically notifies relevant staff</li>
                    </ol>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* User Roles Section */}
      <Box id="roles" sx={{ mb: 5 }}>
        <Typography variant="h4" gutterBottom>
          User Roles & Permissions
        </Typography>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Permissions</strong></TableCell>
                <TableCell><strong>Access Level</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Admin</TableCell>
                <TableCell>Full access to all QA features</TableCell>
                <TableCell>Full</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>IQA</TableCell>
                <TableCell>Verify assessments, create sampling plans, provide feedback</TableCell>
                <TableCell>High</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>EQA</TableCell>
                <TableCell>Read-only access to assessments and IQA records</TableCell>
                <TableCell>Medium</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Assessor</TableCell>
                <TableCell>Submit assessments but cannot modify QA decisions</TableCell>
                <TableCell>Basic</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* System Interface Section */}
      <Box id="system">
        <Typography variant="h4" gutterBottom>
          System Interface Guide
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5">Main Quality Assurance Dashboard</Typography>
                <Typography>
                  The primary interface contains four main tabs:
                </Typography>
                <ul>
                  <li><strong>Dashboard</strong>: Overview of QA metrics</li>
                  <li><strong>IQA Samples</strong>: Assessment verification</li>
                  <li><strong>EQA Visits</strong>: Audit scheduling</li>
                  <li><strong>Sampling Plans</strong>: Quality control setup</li>
                </ul>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                height="300"
                image="https://img.freepik.com/free-vector/dashboard-user-panel-concept-illustration_114360-1665.jpg"
                alt="System Interface"
              />
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

// Enhanced QualityAssurance component with documentation tab
const QualityAssurance = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" gutterBottom>
        Quality Assurance
      </Typography>
      
      <Tabs defaultValue="1" sx={{ mb: 3 }}>
        <Tab value="1" label="Dashboard" icon={<Dashboard />} />
        <Tab value="2" label="IQA Samples" icon={<Checklist />} />
        <Tab value="3" label="EQA Visits" icon={<VerifiedUser />} />
        <Tab value="4" label="Sampling Plans" icon={<Schedule />} />
        <Tab value="5" label="Documentation" icon={<Description />} />
      </Tabs>

      <Box>
        {tabValue === '1' && <QualityDashboard />}
        {tabValue === '2' && <IQASampleList />}
        {tabValue === '3' && <EQAVisitList />}
        {tabValue === '4' && <IQASamplingPlanList />}
        {tabValue === '5' && <QualityAssuranceDocumentation />}
      </Box>
    </Box>
  );
};

export default QualityAssurance;