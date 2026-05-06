import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getProjects, createProject } from '../services/projectService';
import { getUserTasks } from '../services/taskService'; // <-- New import
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);
  
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch projects
      const projectData = await getProjects();
      setProjects(projectData);

      // Fetch tasks and calculate stats
      const taskData = await getUserTasks();
      
      const now = new Date();
      let completed = 0, pending = 0, overdue = 0;

      taskData.forEach(task => {
        if (task.status === 'Completed') {
          completed++;
        } else {
          pending++;
          // Check if overdue
          if (new Date(task.dueDate) < now) {
            overdue++;
          }
        }
      });

      setStats({ total: taskData.length, completed, pending, overdue });

    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await createProject({ title: newProjectTitle, description: newProjectDesc });
      setNewProjectTitle(''); setNewProjectDesc('');
      fetchData(); 
    } catch (error) {
      alert("Error creating project.");
    }
  };

  if (loading) return <div className="p-10 text-center text-xl">Loading Dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Hello, {user.name} 👋</h1>
          <p className="text-gray-500 mt-1">Role: <span className="font-semibold text-blue-600">{user.role}</span></p>
        </div>
        <button onClick={logout} className="px-5 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition">
          Logout
        </button>
      </div>

      {/* NEW: Stats Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-semibold">Total Tasks</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
        </div>
        <div className="bg-blue-50 p-5 rounded-xl shadow-sm border border-blue-100">
          <p className="text-blue-600 text-sm font-semibold">Pending</p>
          <p className="text-3xl font-bold text-blue-700 mt-2">{stats.pending}</p>
        </div>
        <div className="bg-green-50 p-5 rounded-xl shadow-sm border border-green-100">
          <p className="text-green-600 text-sm font-semibold">Completed</p>
          <p className="text-3xl font-bold text-green-700 mt-2">{stats.completed}</p>
        </div>
        <div className="bg-red-50 p-5 rounded-xl shadow-sm border border-red-100">
          <p className="text-red-600 text-sm font-semibold">Overdue</p>
          <p className="text-3xl font-bold text-red-700 mt-2">{stats.overdue}</p>
        </div>
      </div>

      {/* Admin: Create Project Form */}
      {user.role === 'Admin' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Project</h2>
          <form onSubmit={handleCreateProject} className="flex flex-col md:flex-row gap-4">
            <input type="text" placeholder="Project Title" required className="flex-1 px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500" value={newProjectTitle} onChange={(e) => setNewProjectTitle(e.target.value)} />
            <input type="text" placeholder="Short Description" className="flex-1 px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500" value={newProjectDesc} onChange={(e) => setNewProjectDesc(e.target.value)} />
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700">
              + Create
            </button>
          </form>
        </div>
      )}

      {/* Projects Grid */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Projects</h2>
      {projects.length === 0 ? (
        <p className="text-gray-500">No projects found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link to={`/project/${project._id}`} key={project._id} className="block group">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-300 transition h-full">
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition">{project.title}</h3>
                <p className="text-gray-600 mt-2 text-sm line-clamp-2">{project.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;