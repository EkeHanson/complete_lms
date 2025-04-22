// Add this state variable
const [courseSaved, setCourseSaved] = useState(false);

// Modify your handleSubmit function to set courseSaved when successful
const handleSubmit = async (e) => {
  e.preventDefault();
  // ... validation logic ...

  try {
    const response = isEdit 
      ? await coursesAPI.updateCourse(id, formData)
      : await coursesAPI.createCourse(formData);
    
    if (!isEdit) {
      // For new courses, update the URL with the new ID
      navigate(`/admin/courses/${response.data.id}/edit`, { replace: true });
    }
    setCourseSaved(true);
    // ... other success handling ...
  } catch (error) {
    // ... error handling ...
  }
};

// Disable Add Module button until course is saved
<Button
  startIcon={<AddCircle />}
  onClick={addModule}
  sx={{ mt: 2 }}
  size={isMobile ? 'small' : 'medium'}
  disabled={!courseSaved && !isEdit} // Disable if new course not saved
>
  Add Another Module
</Button>