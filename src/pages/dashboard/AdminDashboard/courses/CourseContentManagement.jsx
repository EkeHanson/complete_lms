import React, { useState, useEffect } from 'react';
import './CourseContentManagement.css';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Assignment as AssignmentIcon,
  Quiz as QuizIcon, Grading as GradingIcon, QuestionAnswer as QuestionIcon, QuestionAnswer as QuestionAnswerIcon,
  Save as SaveIcon, Close as CloseIcon, Reorder as ReorderIcon
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material'; // Import CircularProgress from @mui/material
import { useNavigate } from 'react-router-dom';
import { coursesAPI } from '../../../../config';

const CourseContentManagement = () => {

  console.log("Here")
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState(null);

  // Tab-specific error states
  const [questionBankError, setQuestionBankError] = useState(null);
  const [assessmentError, setAssessmentError] = useState(null);
  const [rubricError, setRubricError] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);
  const [faqError, setFaqError] = useState(null);

  // State for Question Banks
  const [questionBanks, setQuestionBanks] = useState([]);
  const [questionBankDialog, setQuestionBankDialog] = useState({ open: false, mode: 'create', data: {}, error: '' });
  const [questionBankPagination, setQuestionBankPagination] = useState({ count: 0, currentPage: 1, rowsPerPage: 10 });

  // State for Quizzes/Assignments
  const [assessments, setAssessments] = useState([]);
  const [assessmentDialog, setAssessmentDialog] = useState({ open: false, mode: 'create', data: {} });
  const [assessmentPagination, setAssessmentPagination] = useState({ count: 0, currentPage: 1, rowsPerPage: 10 });

  // State for Grading Rubrics
  const [rubrics, setRubrics] = useState([]);
  const [rubricDialog, setRubricDialog] = useState({ open: false, mode: 'create', data: {}, error: '' });
  const [rubricPagination, setRubricPagination] = useState({ count: 0, currentPage: 1, rowsPerPage: 10 });

  // State for Moderation
  const [submissions, setSubmissions] = useState([]);
  const [moderationDialog, setModerationDialog] = useState({ open: false, data: {} });
  const [submissionPagination, setSubmissionPagination] = useState({ count: 0, currentPage: 1, rowsPerPage: 10 });

  // State for FAQs
  const [faqs, setFaqs] = useState([]);
  const [faqDialog, setFaqDialog] = useState({ open: false, mode: 'create', data: {} });
  const [faqPagination, setFaqPagination] = useState({ count: 0, currentPage: 1, rowsPerPage: 10 });

  // Fetch courses for dropdowns
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await coursesAPI.getCourses({ page_size: 100 });
      setCourses(response.data.results || []);
      if (response.data.results?.length > 0) {
        setSelectedCourseId(response.data.results[0].id);
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to fetch courses', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch modules for the selected course
  const fetchModules = async () => {
    if (!selectedCourseId) {
      setModules([]);
      setSelectedModuleId(null);
      return;
    }

    setLoading(true);
    try {
      const response = await coursesAPI.getModules(selectedCourseId, { page_size: 100 });
      setModules(response.data.results || []);
      if (response.data.results?.length > 0) {
        setSelectedModuleId(response.data.results[0].id);
      } else {
        setSelectedModuleId(null);
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to fetch modules', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch question banks
  const fetchQuestionBanks = async () => {
    setLoading(true);
    setQuestionBankError(null);
    try {
      const response = await coursesAPI.getQuestionBanks({
        params: { page: questionBankPagination.currentPage, page_size: questionBankPagination.rowsPerPage }
      });
      setQuestionBanks(response.data.results || []);
      setQuestionBankPagination(prev => ({ ...prev, count: response.data.count || 0 }));
    } catch (err) {
      setQuestionBankError('Failed to fetch question banks');
    } finally {
      setLoading(false);
    }
  };

  // Fetch assessments (quizzes/assignments)
  const fetchAssessments = async () => {
    if (!selectedCourseId || !selectedModuleId) {
      setAssessments([]);
      setAssessmentPagination(prev => ({ ...prev, count: 0 }));
      return;
    }

    setLoading(true);
    setAssessmentError(null);
    try {
      const response = await coursesAPI.getLessons(selectedCourseId, selectedModuleId, {
        page: assessmentPagination.currentPage,
        page_size: assessmentPagination.rowsPerPage,
        lesson_type: 'quiz,assignment'
      });
      setAssessments(response.data.results || []);
      setAssessmentPagination(prev => ({ ...prev, count: response.data.count || 0 }));
    } catch (err) {
      setAssessmentError('Failed to fetch assessments');
      setSnackbar({ open: true, message: 'Failed to fetch assessments', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch grading rubrics
  const fetchRubrics = async () => {
    setLoading(true);
    setRubricError(null);
    try {
      const response = await coursesAPI.getRubrics({
        params: { page: rubricPagination.currentPage, page_size: rubricPagination.rowsPerPage }
      });
      setRubrics(response.data.results || []);
      setRubricPagination(prev => ({ ...prev, count: response.data.count || 0 }));
    } catch (err) {
      setRubricError('Failed to fetch rubrics');
    } finally {
      setLoading(false);
    }
  };

  // Fetch submissions for moderation
  const fetchSubmissions = async () => {
    setLoading(true);
    setSubmissionError(null);
    try {
      const response = await coursesAPI.getSubmissions({
        params: { page: submissionPagination.currentPage, page_size: submissionPagination.rowsPerPage }
      });
      setSubmissions(response.data.results || []);
      setSubmissionPagination(prev => ({ ...prev, count: response.data.count || 0 }));
    } catch (err) {
      setSubmissionError('Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch FAQs for the selected course
  const fetchFAQs = async () => {
    if (!selectedCourseId) {
      setFaqs([]);
      setFaqError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setFaqError(null);
    try {
      const response = await coursesAPI.getFAQs(selectedCourseId, {
        page: faqPagination.currentPage,
        page_size: faqPagination.rowsPerPage
      });
      setFaqs(response.data.results || []);
      setFaqPagination(prev => ({
        ...prev,
        count: response.data.count || 0
      }));
    } catch (err) {
      setFaqError('Failed to fetch FAQs');
      setFaqs([]);
      setSnackbar({ open: true, message: 'Failed to fetch FAQs', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handle question bank CRUD
  const handleQuestionBankSave = async () => {
    const { mode, data } = questionBankDialog;
    try {
      if (mode === 'create') {
        await coursesAPI.createQuestionBank(data);
        setSnackbar({ open: true, message: 'Question bank created', severity: 'success' });
      } else {
        await coursesAPI.updateQuestionBank(data.id, data);
        setSnackbar({ open: true, message: 'Question bank updated', severity: 'success' });
      }
      fetchQuestionBanks();
      setQuestionBankDialog({ open: false, mode: 'create', data: {}, error: '' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save question bank', severity: 'error' });
    }
  };

  const handleQuestionBankDelete = async (id) => {
    try {
      await coursesAPI.deleteQuestionBank(id);
      fetchQuestionBanks();
      setSnackbar({ open: true, message: 'Question bank deleted', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete question bank', severity: 'error' });
    }
  };

  // Handle assessment CRUD
  const handleAssessmentSave = async () => {
    const { mode, data } = assessmentDialog;
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, value));
      if (mode === 'create') {
        await coursesAPI.createLesson(data.course_id, data.module_id, formData);
        setSnackbar({ open: true, message: 'Assessment created', severity: 'success' });
      } else {
        await coursesAPI.updateLesson(data.course_id, data.module_id, data.id, formData);
        setSnackbar({ open: true, message: 'Assessment updated', severity: 'success' });
      }
      fetchAssessments();
      setAssessmentDialog({ open: false, mode: 'create', data: {} });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save assessment', severity: 'error' });
    }
  };

  const handleAssessmentDelete = async (assessment) => {
    try {
      await coursesAPI.deleteLesson(assessment.course_id, assessment.module_id, assessment.id);
      fetchAssessments();
      setSnackbar({ open: true, message: 'Assessment deleted', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete assessment', severity: 'error' });
    }
  };

  // Handle rubric CRUD
  const handleRubricSave = async () => {
    const { mode, data } = rubricDialog;
    try {
      if (mode === 'create') {
        await coursesAPI.createRubric(data);
        setSnackbar({ open: true, message: 'Rubric created', severity: 'success' });
      } else {
        await coursesAPI.updateRubric(data.id, data);
        setSnackbar({ open: true, message: 'Rubric updated', severity: 'success' });
      }
      fetchRubrics();
      setRubricDialog({ open: false, mode: 'create', data: {}, error: '' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save rubric', severity: 'error' });
    }
  };

  const handleRubricDelete = async (id) => {
    try {
      await coursesAPI.deleteRubric(id);
      fetchRubrics();
      setSnackbar({ open: true, message: 'Rubric deleted', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete rubric', severity: 'error' });
    }
  };

  // Handle submission moderation
  const handleSubmissionSave = async () => {
    const { data } = moderationDialog;
    try {
      await coursesAPI.updateSubmission(data.id, { grade: data.grade, feedback: data.feedback });
      fetchSubmissions();
      setModerationDialog({ open: false, data: {} });
      setSnackbar({ open: true, message: 'Submission updated', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update submission', severity: 'error' });
    }
  };

  // Handle FAQ CRUD operations
  const handleFaqSave = async () => {
    const { mode, data } = faqDialog;
    if (!selectedCourseId) {
      setSnackbar({ open: true, message: 'Please select a course first', severity: 'error' });
      return;
    }

    try {
      if (mode === 'create') {
        await coursesAPI.createFAQ(selectedCourseId, { ...data, course_id: selectedCourseId });
        setSnackbar({ open: true, message: 'FAQ created', severity: 'success' });
      } else {
        await coursesAPI.updateFAQ(selectedCourseId, data.id, data);
        setSnackbar({ open: true, message: 'FAQ updated', severity: 'success' });
      }
      fetchFAQs();
      setFaqDialog({ open: false, mode: 'create', data: {} });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save FAQ', severity: 'error' });
    }
  };

  const handleFaqDelete = async (id) => {
    if (!selectedCourseId) return;

    try {
      await coursesAPI.deleteFAQ(selectedCourseId, id);
      fetchFAQs();
      setSnackbar({ open: true, message: 'FAQ deleted', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete FAQ', severity: 'error' });
    }
  };

  const handleFaqReorder = async () => {
    if (!selectedCourseId) return;

    try {
      const currentOrder = faqs.map(faq => ({ id: faq.id, order: faq.order }));
      const newOrder = [...currentOrder]
        .sort((a, b) => a.order - b.order)
        .map((faq, index) => ({ id: faq.id, order: index + 1 }));
      await coursesAPI.reorderFAQs(selectedCourseId, { faqs: newOrder });
      fetchFAQs();
      setSnackbar({ open: true, message: 'FAQs reordered successfully', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to reorder FAQs', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Pagination handlers
  const handlePageChange = (pagination, setPagination) => (event, newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage + 1 }));
  };

  const handleRowsPerPageChange = (pagination, setPagination) => (event) => {
    setPagination(prev => ({ ...prev, rowsPerPage: parseInt(event.target.value, 10), currentPage: 1 }));
  };

  // Render tab content
  const renderQuestionBanks = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h3><QuestionIcon className="icon" /> Question Banks</h3>
        <button
          className="action-btn primary"
          onClick={() => setQuestionBankDialog({ open: true, mode: 'create', data: {}, error: '' })}
        >
          <AddIcon className="icon" /> Add Question Bank
        </button>
      </div>
      <div className="table-container">
        <table className="content-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Course</th>
              <th>Questions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="empty-state"><CircularProgress /></td></tr>
            ) : questionBankError ? (
              <tr><td colSpan={4} className="empty-state error">{questionBankError}</td></tr>
            ) : questionBanks.length === 0 ? (
              <tr><td colSpan={4} className="empty-state">No question banks found</td></tr>
            ) : (
              questionBanks.map(bank => (
                <tr key={bank.id}>
                  <td>{bank.title}</td>
                  <td>{bank.course?.title || 'N/A'}</td>
                  <td>{bank.questions?.length || 0}</td>
                  <td>
                    <button
                      className="action-btn"
                      onClick={() => setQuestionBankDialog({ open: true, mode: 'edit', data: bank, error: '' })}
                    >
                      <EditIcon className="icon" />
                    </button>
                    <button
                      className="action-btn danger"
                      onClick={() => handleQuestionBankDelete(bank.id)}
                    >
                      <DeleteIcon className="icon" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="pagination">
          <div className="pagination-options">
            <span>Rows per page:</span>
            <select
              value={questionBankPagination.rowsPerPage}
              onChange={handleRowsPerPageChange(questionBankPagination, setQuestionBankPagination)}
            >
              {[5, 10, 25].map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="pagination-controls">
            <button
              disabled={questionBankPagination.currentPage === 1}
              onClick={() => setQuestionBankPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
            >
              Previous
            </button>
            <span>{questionBankPagination.currentPage} of {Math.ceil(questionBankPagination.count / questionBankPagination.rowsPerPage)}</span>
            <button
              disabled={questionBankPagination.currentPage === Math.ceil(questionBankPagination.count / questionBankPagination.rowsPerPage)}
              onClick={() => setQuestionBankPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAssessments = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h3><QuizIcon className="icon" /> Quizzes & Assignments</h3>
        <div className="tab-header-controls">
          <select
            className="select"
            value={selectedCourseId || ''}
            onChange={(e) => {
              setSelectedCourseId(e.target.value || null);
              setSelectedModuleId(null);
            }}
          >
            <option value="">Select Course</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
          <select
            className="select"
            value={selectedModuleId || ''}
            onChange={(e) => setSelectedModuleId(e.target.value || null)}
          >
            <option value="">Select Module</option>
            {modules.map(module => (
              <option key={module.id} value={module.id}>{module.title}</option>
            ))}
          </select>
          <button
            className="action-btn primary"
            onClick={() => setAssessmentDialog({ open: true, mode: 'create', data: { course_id: selectedCourseId, module_id: selectedModuleId } })}
            disabled={!selectedCourseId || !selectedModuleId}
          >
            <AddIcon className="icon" /> Add Assessment
          </button>
        </div>
      </div>
      {!selectedCourseId || !selectedModuleId ? (
        <div className="empty-state">Please select a course and module to view assessments</div>
      ) : loading ? (
        <div className="empty-state"><CircularProgress /></div>
      ) : assessmentError ? (
        <div className="empty-state error">{assessmentError}</div>
      ) : assessments.length === 0 ? (
        <div className="empty-state">No assessments found for this module</div>
      ) : (
        <div className="table-container">
          <table className="content-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Course</th>
                <th>Module</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((assessment) => (
                <tr key={assessment.id}>
                  <td>{assessment.title}</td>
                  <td>
                    <span className={`status-badge ${assessment.lesson_type}`}>
                      {assessment.lesson_type}
                    </span>
                  </td>
                  <td>{assessment.module?.course?.title || 'N/A'}</td>
                  <td>{assessment.module?.title || 'N/A'}</td>
                  <td>
                    <button
                      className="action-btn"
                      onClick={() => setAssessmentDialog({ open: true, mode: 'edit', data: assessment })}
                    >
                      <EditIcon className="icon" />
                    </button>
                    <button
                      className="action-btn danger"
                      onClick={() => handleAssessmentDelete(assessment)}
                    >
                      <DeleteIcon className="icon" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <div className="pagination-options">
              <span>Rows per page:</span>
              <select
                value={assessmentPagination.rowsPerPage}
                onChange={handleRowsPerPageChange(assessmentPagination, setAssessmentPagination)}
              >
                {[5, 10, 25].map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="pagination-controls">
              <button
                disabled={assessmentPagination.currentPage === 1}
                onClick={() => setAssessmentPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
              >
                Previous
              </button>
              <span>{assessmentPagination.currentPage} of {Math.ceil(assessmentPagination.count / assessmentPagination.rowsPerPage)}</span>
              <button
                disabled={assessmentPagination.currentPage === Math.ceil(assessmentPagination.count / assessmentPagination.rowsPerPage)}
                onClick={() => setAssessmentPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderRubrics = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h3><GradingIcon className="icon" /> Grading Rubrics</h3>
        <button
          className="action-btn primary"
          onClick={() => setRubricDialog({ open: true, mode: 'create', data: {}, error: '' })}
        >
          <AddIcon className="icon" /> Add Rubric
        </button>
      </div>
      <div className="table-container">
        <table className="content-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Course</th>
              <th>Total Points</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="empty-state"><CircularProgress /></td></tr>
            ) : rubricError ? (
              <tr><td colSpan={4} className="empty-state error">{rubricError}</td></tr>
            ) : rubrics.length === 0 ? (
              <tr><td colSpan={4} className="empty-state">No rubrics found</td></tr>
            ) : (
              rubrics.map(rubric => (
                <tr key={rubric.id}>
                  <td>{rubric.title}</td>
                  <td>{rubric.course?.title || 'N/A'}</td>
                  <td>{rubric.total_points || 0}</td>
                  <td>
                    <button
                      className="action-btn"
                      onClick={() => setRubricDialog({ open: true, mode: 'edit', data: rubric, error: '' })}
                    >
                      <EditIcon className="icon" />
                    </button>
                    <button
                      className="action-btn danger"
                      onClick={() => handleRubricDelete(rubric.id)}
                    >
                      <DeleteIcon className="icon" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="pagination">
          <div className="pagination-options">
            <span>Rows per page:</span>
            <select
              value={rubricPagination.rowsPerPage}
              onChange={handleRowsPerPageChange(rubricPagination, setRubricPagination)}
            >
              {[5, 10, 25].map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="pagination-controls">
            <button
              disabled={rubricPagination.currentPage === 1}
              onClick={() => setRubricPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
            >
              Previous
            </button>
            <span>{rubricPagination.currentPage} of {Math.ceil(rubricPagination.count / rubricPagination.rowsPerPage)}</span>
            <button
              disabled={rubricPagination.currentPage === Math.ceil(rubricPagination.count / rubricPagination.rowsPerPage)}
              onClick={() => setRubricPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModeration = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h3><AssignmentIcon className="icon" /> Assessment Moderation</h3>
      </div>
      <div className="table-container">
        <table className="content-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Assessment</th>
              <th>Status</th>
              <th>Grade</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="empty-state"><CircularProgress /></td></tr>
            ) : submissionError ? (
              <tr><td colSpan={5} className="empty-state error">{submissionError}</td></tr>
            ) : submissions.length === 0 ? (
              <tr><td colSpan={5} className="empty-state">No submissions found</td></tr>
            ) : (
              submissions.map(submission => (
                <tr key={submission.id}>
                  <td>{submission.user?.email || 'N/A'}</td>
                  <td>{submission.lesson?.title || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${submission.status}`}>
                      {submission.status}
                    </span>
                  </td>
                  <td>{submission.grade || 'N/A'}</td>
                  <td>
                    <button
                      className="action-btn"
                      onClick={() => setModerationDialog({ open: true, data: submission })}
                    >
                      Moderate
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="pagination">
          <div className="pagination-options">
            <span>Rows per page:</span>
            <select
              value={submissionPagination.rowsPerPage}
              onChange={handleRowsPerPageChange(submissionPagination, setSubmissionPagination)}
            >
              {[5, 10, 25].map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="pagination-controls">
            <button
              disabled={submissionPagination.currentPage === 1}
              onClick={() => setSubmissionPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
            >
              Previous
            </button>
            <span>{submissionPagination.currentPage} of {Math.ceil(submissionPagination.count / submissionPagination.rowsPerPage)}</span>
            <button
              disabled={submissionPagination.currentPage === Math.ceil(submissionPagination.count / submissionPagination.rowsPerPage)}
              onClick={() => setSubmissionPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFAQs = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h3><QuestionAnswerIcon className="icon" /> Frequently Asked Questions</h3>
        <div className="tab-header-controls">
          <select
            className="select"
            value={selectedCourseId || ''}
            onChange={(e) => {
              setSelectedCourseId(e.target.value || null);
              setFaqPagination(prev => ({ ...prev, currentPage: 1 }));
            }}
          >
            <option value="">Select Course</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
          <button
            className="action-btn"
            onClick={handleFaqReorder}
            disabled={!selectedCourseId || faqs.length === 0}
          >
            <ReorderIcon className="icon" /> Reorder
          </button>
          <button
            className="action-btn primary"
            onClick={() => setFaqDialog({ 
              open: true, 
              mode: 'create', 
              data: { 
                course_id: selectedCourseId,
                is_active: true,
                order: faqs.length > 0 ? Math.max(...faqs.map(f => f.order)) + 1 : 1
              } 
            })}
            disabled={!selectedCourseId}
          >
            <AddIcon className="icon" /> Add FAQ
          </button>
        </div>
      </div>
      {!selectedCourseId ? (
        <div className="empty-state">Please select a course to view its FAQs</div>
      ) : loading ? (
        <div className="empty-state"><CircularProgress /></div>
      ) : faqError ? (
        <div className="empty-state error">{faqError}</div>
      ) : faqs.length === 0 ? (
        <div className="empty-state">No FAQs found for this course</div>
      ) : (
        <div className="table-container">
          <table className="content-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Answer</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {faqs.map(faq => (
                <tr key={faq.id}>
                  <td>{faq.question}</td>
                  <td>{faq.answer}</td>
                  <td>{faq.order}</td>
                  <td>
                    <span className={`status-badge ${faq.is_active ? 'active' : 'inactive'}`}>
                      {faq.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="action-btn"
                      onClick={() => setFaqDialog({ open: true, mode: 'edit', data: faq })}
                    >
                      <EditIcon className="icon" />
                    </button>
                    <button
                      className="action-btn danger"
                      onClick={() => handleFaqDelete(faq.id)}
                    >
                      <DeleteIcon className="icon" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <div className="pagination-options">
              <span>Rows per page:</span>
              <select
                value={faqPagination.rowsPerPage}
                onChange={(e) => setFaqPagination(prev => ({ 
                  ...prev, 
                  rowsPerPage: parseInt(e.target.value, 10), 
                  currentPage: 1 
                }))}
              >
                {[5, 10, 25].map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="pagination-controls">
              <button
                disabled={faqPagination.currentPage === 1}
                onClick={() => setFaqPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
              >
                Previous
              </button>
              <span>{faqPagination.currentPage} of {Math.ceil(faqPagination.count / faqPagination.rowsPerPage)}</span>
              <button
                disabled={faqPagination.currentPage === Math.ceil(faqPagination.count / faqPagination.rowsPerPage)}
                onClick={() => setFaqPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  useEffect(() => {
    fetchCourses();
    fetchModules();
    setQuestionBankError(null);
    setAssessmentError(null);
    setRubricError(null);
    setSubmissionError(null);
    setFaqError(null);
    if (activeTab === 0) fetchQuestionBanks();
    else if (activeTab === 1) fetchAssessments();
    else if (activeTab === 2) fetchRubrics();
    else if (activeTab === 3) fetchSubmissions();
  }, [
    activeTab,
    selectedCourseId,
    questionBankPagination.currentPage, questionBankPagination.rowsPerPage,
    assessmentPagination.currentPage, assessmentPagination.rowsPerPage,
    rubricPagination.currentPage, rubricPagination.rowsPerPage,
    submissionPagination.currentPage, submissionPagination.rowsPerPage,
    faqPagination.currentPage, faqPagination.rowsPerPage
  ]);

  useEffect(() => {
    if (activeTab === 4 && selectedCourseId) {
      fetchFAQs();
    } else if (activeTab === 4 && !selectedCourseId) {
      setFaqs([]);
      setFaqError(null);
    }
  }, [activeTab, selectedCourseId, faqPagination.currentPage, faqPagination.rowsPerPage]);

  useEffect(() => {
    if (activeTab === 1) {
      fetchAssessments();
    }
  }, [activeTab, selectedCourseId, selectedModuleId, assessmentPagination.currentPage, assessmentPagination.rowsPerPage]);

  return (
    <div className="CourseContentManagement">
      <div className="CourseContentManagement-Top">
        <h2>Course Content Management</h2>
      </div>
      <div className="CourseContentManagement-Content">
        <div className="tabs">
          <div className={`tab ${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}>
            <QuestionIcon className="icon" /> Question Banks
          </div>
          <div className={`tab ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>
            <QuizIcon className="icon" /> Quizzes & Assignments
          </div>
          <div className={`tab ${activeTab === 2 ? 'active' : ''}`} onClick={() => setActiveTab(2)}>
            <GradingIcon className="icon" /> Grading Rubrics
          </div>
          <div className={`tab ${activeTab === 3 ? 'active' : ''}`} onClick={() => setActiveTab(3)}>
            <AssignmentIcon className="icon" /> Moderation
          </div>
          <div className={`tab ${activeTab === 4 ? 'active' : ''}`} onClick={() => setActiveTab(4)}>
            <QuestionAnswerIcon className="icon" /> FAQs
          </div>
        </div>
        <div className="tab-content-wrapper">
          {activeTab === 0 && renderQuestionBanks()}
          {activeTab === 1 && renderAssessments()}
          {activeTab === 2 && renderRubrics()}
          {activeTab === 3 && renderModeration()}
          {activeTab === 4 && renderFAQs()}
        </div>
      </div>
      <div className={`modal ${questionBankDialog.open ? 'open' : ''}`}>
        <div className="modal-overlay" onClick={() => setQuestionBankDialog({ open: false, mode: 'create', data: {}, error: '' })}></div>
        <div className="modal-content">
          <div className="modal-header">
            <h3>{questionBankDialog.mode === 'create' ? 'Create Question Bank' : 'Edit Question Bank'}</h3>
            <button
              className="close-btn"
              onClick={() => setQuestionBankDialog({ open: false, mode: 'create', data: {}, error: '' })}
            >
              <CloseIcon className="icon" />
            </button>
          </div>
          <div className="modal-body">
            <label className="label">Title</label>
            <input
              className="input"
              value={questionBankDialog.data.title || ''}
              onChange={e => setQuestionBankDialog(prev => ({ ...prev, data: { ...prev.data, title: e.target.value }, error: '' }))}
            />
            <label className="label">Course</label>
            <select
              className="select"
              value={questionBankDialog.data.course_id || ''}
              onChange={e => setQuestionBankDialog(prev => ({ ...prev, data: { ...prev.data, course_id: e.target.value }, error: '' }))}
            >
              <option value="">Select Course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
            <label className="label">Questions (JSON)</label>
            <textarea
              className="textarea"
              value={questionBankDialog.data.questions ? JSON.stringify(questionBankDialog.data.questions, null, 2) : ''}
              onChange={e => {
                try {
                  const parsedQuestions = JSON.parse(e.target.value);
                  setQuestionBankDialog(prev => ({
                    ...prev,
                    data: { ...prev.data, questions: parsedQuestions },
                    error: ''
                  }));
                } catch (err) {
                  setQuestionBankDialog(prev => ({
                    ...prev,
                    error: 'Invalid JSON format'
                  }));
                }
              }}
            />
            {questionBankDialog.error && <div className="error">{questionBankDialog.error}</div>}
          </div>
          <div className="modal-footer">
            <button
              className="action-btn"
              onClick={() => setQuestionBankDialog({ open: false, mode: 'create', data: {}, error: '' })}
            >
              Cancel
            </button>
            <button
              className="action-btn primary"
              onClick={handleQuestionBankSave}
              disabled={!!questionBankDialog.error}
            >
              <SaveIcon className="icon" /> Save
            </button>
          </div>
        </div>
      </div>
      <div className={`modal ${assessmentDialog.open ? 'open' : ''}`}>
        <div className="modal-overlay" onClick={() => setAssessmentDialog({ open: false, mode: 'create', data: {} })}></div>
        <div className="modal-content">
          <div className="modal-header">
            <h3>{assessmentDialog.mode === 'create' ? 'Create Assessment' : 'Edit Assessment'}</h3>
            <button
              className="close-btn"
              onClick={() => setAssessmentDialog({ open: false, mode: 'create', data: {} })}
            >
              <CloseIcon className="icon" />
            </button>
          </div>
          <div className="modal-body">
            <label className="label">Title</label>
            <input
              className="input"
              value={assessmentDialog.data.title || ''}
              onChange={e => setAssessmentDialog(prev => ({ ...prev, data: { ...prev.data, title: e.target.value } }))}
            />
            <label className="label">Type</label>
            <select
              className="select"
              value={assessmentDialog.data.lesson_type || 'quiz'}
              onChange={e => setAssessmentDialog(prev => ({ ...prev, data: { ...prev.data, lesson_type: e.target.value } }))}
            >
              <option value="quiz">Quiz</option>
              <option value="assignment">Assignment</option>
            </select>
            <label className="label">Course</label>
            <select
              className="select"
              value={assessmentDialog.data.course_id || ''}
              onChange={e => setAssessmentDialog(prev => ({ ...prev, data: { ...prev.data, course_id: e.target.value } }))}
            >
              <option value="">Select Course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
            <label className="label">Module ID</label>
            <input
              className="input"
              value={assessmentDialog.data.module_id || ''}
              onChange={e => setAssessmentDialog(prev => ({ ...prev, data: { ...prev.data, module_id: e.target.value } }))}
            />
            <label className="label">Description</label>
            <textarea
              className="textarea"
              value={assessmentDialog.data.description || ''}
              onChange={e => setAssessmentDialog(prev => ({ ...prev, data: { ...prev.data, description: e.target.value } }))}
            />
          </div>
          <div className="modal-footer">
            <button
              className="action-btn"
              onClick={() => setAssessmentDialog({ open: false, mode: 'create', data: {} })}
            >
              Cancel
            </button>
            <button
              className="action-btn primary"
              onClick={handleAssessmentSave}
            >
              <SaveIcon className="icon" /> Save
            </button>
          </div>
        </div>
      </div>
      <div className={`modal ${rubricDialog.open ? 'open' : ''}`}>
        <div className="modal-overlay" onClick={() => setRubricDialog({ open: false, mode: 'create', data: {}, error: '' })}></div>
        <div className="modal-content">
          <div className="modal-header">
            <h3>{rubricDialog.mode === 'create' ? 'Create Rubric' : 'Edit Rubric'}</h3>
            <button
              className="close-btn"
              onClick={() => setRubricDialog({ open: false, mode: 'create', data: {}, error: '' })}
            >
              <CloseIcon className="icon" />
            </button>
          </div>
          <div className="modal-body">
            <label className="label">Title</label>
            <input
              className="input"
              value={rubricDialog.data.title || ''}
              onChange={e => setRubricDialog(prev => ({ ...prev, data: { ...prev.data, title: e.target.value }, error: '' }))}
            />
            <label className="label">Course</label>
            <select
              className="select"
              value={rubricDialog.data.course_id || ''}
              onChange={e => setRubricDialog(prev => ({ ...prev, data: { ...prev.data, course_id: e.target.value }, error: '' }))}
            >
              <option value="">Select Course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
            <label className="label">Criteria (JSON)</label>
            <textarea
              className="textarea"
              value={rubricDialog.data.criteria ? JSON.stringify(rubricDialog.data.criteria, null, 2) : ''}
              onChange={e => {
                try {
                  const parsedCriteria = JSON.parse(e.target.value);
                  setRubricDialog(prev => ({
                    ...prev,
                    data: { ...prev.data, criteria: parsedCriteria },
                    error: ''
                  }));
                } catch (err) {
                  setRubricDialog(prev => ({
                    ...prev,
                    error: 'Invalid JSON format'
                  }));
                }
              }}
            />
            {rubricDialog.error && <div className="error">{rubricDialog.error}</div>}
          </div>
          <div className="modal-footer">
            <button
              className="action-btn"
              onClick={() => setRubricDialog({ open: false, mode: 'create', data: {}, error: '' })}
            >
              Cancel
            </button>
            <button
              className="action-btn primary"
              onClick={handleRubricSave}
              disabled={!!rubricDialog.error}
            >
              <SaveIcon className="icon" /> Save
            </button>
          </div>
        </div>
      </div>
      <div className={`modal ${moderationDialog.open ? 'open' : ''}`}>
        <div className="modal-overlay" onClick={() => setModerationDialog({ open: false, data: {} })}></div>
        <div className="modal-content">
          <div className="modal-header">
            <h3>Moderate Submission</h3>
            <button
              className="close-btn"
              onClick={() => setModerationDialog({ open: false, data: {} })}
            >
              <CloseIcon className="icon" />
            </button>
          </div>
          <div className="modal-body">
            <div className="info-item"><span>User:</span> <strong>{moderationDialog.data.user?.email || 'N/A'}</strong></div>
            <div className="info-item"><span>Assessment:</span> <strong>{moderationDialog.data.lesson?.title || 'N/A'}</strong></div>
            <div className="info-item"><span>Status:</span> <strong>{moderationDialog.data.status || 'N/A'}</strong></div>
            <label className="label">Grade</label>
            <input
              className="input"
              type="number"
              value={moderationDialog.data.grade || ''}
              onChange={e => setModerationDialog(prev => ({ ...prev, data: { ...prev.data, grade: e.target.value } }))}
            />
            <label className="label">Feedback</label>
            <textarea
              className="textarea"
              value={moderationDialog.data.feedback || ''}
              onChange={e => setModerationDialog(prev => ({ ...prev, data: { ...prev.data, feedback: e.target.value } }))}
            />
          </div>
          <div className="modal-footer">
            <button
              className="action-btn"
              onClick={() => setModerationDialog({ open: false, data: {} })}
            >
              Cancel
            </button>
            <button
              className="action-btn primary"
              onClick={handleSubmissionSave}
            >
              <SaveIcon className="icon" /> Save
            </button>
          </div>
        </div>
      </div>
      <div className={`modal ${faqDialog.open ? 'open' : ''}`}>
        <div className="modal-overlay" onClick={() => setFaqDialog({ open: false, mode: 'create', data: {} })}></div>
        <div className="modal-content">
          <div className="modal-header">
            <h3>{faqDialog.mode === 'create' ? 'Create FAQ' : 'Edit FAQ'}</h3>
            <button
              className="close-btn"
              onClick={() => setFaqDialog({ open: false, mode: 'create', data: {} })}
            >
              <CloseIcon className="icon" />
            </button>
          </div>
          <div className="modal-body">
            <label className="label">Question</label>
            <input
              className="input"
              value={faqDialog.data.question || ''}
              onChange={e => setFaqDialog(prev => ({
                ...prev,
                data: { ...prev.data, question: e.target.value }
              }))}
            />
            <label className="label">Answer</label>
            <textarea
              className="textarea"
              value={faqDialog.data.answer || ''}
              onChange={e => setFaqDialog(prev => ({
                ...prev,
                data: { ...prev.data, answer: e.target.value }
              }))}
            />
            <label className="label">Order</label>
            <input
              className="input"
              type="number"
              value={faqDialog.data.order || 0}
              onChange={e => setFaqDialog(prev => ({
                ...prev,
                data: { ...prev.data, order: parseInt(e.target.value) || 0 }
              }))}
            />
            <label className="label">Status</label>
            <select
              className="select"
              value={faqDialog.data.is_active !== undefined ? faqDialog.data.is_active : true}
              onChange={e => setFaqDialog(prev => ({
                ...prev,
                data: { ...prev.data, is_active: e.target.value === 'true' }
              }))}
            >
              <option value={true}>Active</option>
              <option value={false}>Inactive</option>
            </select>
          </div>
          <div className="modal-footer">
            <button
              className="action-btn"
              onClick={() => setFaqDialog({ open: false, mode: 'create', data: {} })}
            >
              Cancel
            </button>
            <button
              className="action-btn primary"
              onClick={handleFaqSave}
            >
              <SaveIcon className="icon" /> Save
            </button>
          </div>
        </div>
      </div>
      <div className={`notification ${snackbar.open ? 'open' : ''} ${snackbar.severity}`}>
        {snackbar.message}
      </div>
    </div>
  );
};

export default CourseContentManagement;
