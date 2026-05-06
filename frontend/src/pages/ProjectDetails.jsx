import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getProjectTasks, createTask, updateTaskStatus } from '../services/taskService';
import { getProjects, updateProject } from '../services/projectService';
import { getAllUsers } from '../services/userService'; // <-- New import

const ProjectDetails = () => {
  const { projectId } = useParams();
  const { user } = useContext(AuthContext);

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Users & Team Management State
  const [allUsers, setAllUsers] = useState([]);
  const [selectedNewMember, setSelectedNewMember] = useState('');

  // New Task Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const allProjects = await getProjects();
      const currentProject = allProjects.find(p => p._id === projectId);
      setProject(currentProject);

      const projectTasks = await getProjectTasks(projectId);
      setTasks(projectTasks);

      // If the user is an Admin, fetch all registered users so they can add them to the team
      if (user.role === 'Admin') {
        const users = await getAllUsers();
        setAllUsers(users);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: Add Member Logic ---
  const handleAddMember = async () => {
    if (!selectedNewMember) return;
    try {
      // Get array of current member IDs, and add the new one
      const currentMemberIds = project.members.map(m => m._id);
      await updateProject(projectId, { members: [...currentMemberIds, selectedNewMember] });

      setSelectedNewMember(''); // Reset dropdown
      fetchData(); // Refresh the page to show the new member!
    } catch (error) {
      alert("Failed to add member.");
      console.error(error);
    }
  };
  // -----------------------------

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await createTask(projectId, { title, description, dueDate, assignedTo });
      setTitle(''); setDescription(''); setDueDate(''); setAssignedTo('');
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      fetchData();
    } catch (error) {
      alert("Not authorized to update this task's status.");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Task Board...</div>;
  if (!project) return <div className="p-10 text-center text-red-500">Project not found or access denied.</div>;

  // Filter out users who are already in the project so they don't show up in the "Add Member" dropdown twice
  const availableUsersToAdd = allUsers.filter(u => !project.members.some(m => m._id === u._id));

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <Link to="/" className="text-blue-600 hover:underline mb-2 inline-block">← Back to Dashboard</Link>
        <h1 className="text-3xl font-bold text-gray-800">{project.title} - Task Board</h1>
        <p className="text-gray-600 mt-1">{project.description}</p>
      </div>

      {/* NEW: Admin Team Management Tool */}
      {user.role === 'Admin' && (
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6 flex items-center gap-4">
          <span className="font-semibold text-blue-800">Team Members:</span>
          <div className="flex gap-2 text-sm">
            {project.members.length === 0 ? <span className="text-gray-500 italic">No members yet</span> :
              project.members.map(m => (
                <span key={m._id} className="bg-white px-3 py-1 rounded-full border border-blue-200 text-blue-700">{m.name}</span>
              ))
            }
          </div>

          <div className="ml-auto flex gap-2">
            <select
              className="px-3 py-1 border border-gray-300 rounded focus:outline-none"
              value={selectedNewMember} onChange={(e) => setSelectedNewMember(e.target.value)}
            >
              <option value="">Add a user to project...</option>
              {availableUsersToAdd.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
            </select>
            <button onClick={handleAddMember} className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">
              Invite
            </button>
          </div>
        </div>
      )}

      {/* Admin: Create Task Form */}
      {user.role === 'Admin' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Add New Task</h2>
          <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <input
              type="text" required placeholder="Task Title"
              className="px-3 py-2 border rounded focus:outline-none"
              value={title} onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="text" placeholder="Description"
              className="px-3 py-2 border rounded focus:outline-none"
              value={description} onChange={(e) => setDescription(e.target.value)}
            />
            <input
              type="date" required
              className="px-3 py-2 border rounded focus:outline-none"
              value={dueDate} onChange={(e) => setDueDate(e.target.value)}
            />

            {/* The dropdown you were stuck on! It will now populate once you add members above. */}
            <select
              className="px-3 py-2 border rounded focus:outline-none bg-white"
              value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} required
            >
              <option value="">Assign To...</option>
              {project.members.map(member => (
                <option key={member._id} value={member._id}>{member.name}</option>
              ))}
            </select>

            <button type="submit" className="bg-green-600 text-white font-semibold rounded hover:bg-green-700">
              Add Task
            </button>
          </form>
        </div>
      )}

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map(task => {
          const isAssignedToMe = task.assignedTo?._id === user._id;
          const canEdit = user.role === 'Admin' || isAssignedToMe;

          return (
            <div key={task._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-800 text-lg">{task.title}</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${task.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                  }`}>
                  {task.status}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4 grow">{task.description}</p>
              <div className="text-xs text-gray-500 mb-4 space-y-1">
                <p><strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}</p>
                <p><strong>Assignee:</strong> {task.assignedTo?.name || 'Unassigned'}</p>
              </div>
              {canEdit ? (
                <select
                  className="w-full px-3 py-2 text-sm border rounded bg-gray-50 focus:outline-none"
                  value={task.status}
                  onChange={(e) => handleStatusChange(task._id, e.target.value)}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Completed">Overdue</option>

                </select>
              ) : (
                <div className="w-full px-3 py-2 text-sm border rounded bg-gray-100 text-gray-400 text-center cursor-not-allowed">
                  View Only
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectDetails;