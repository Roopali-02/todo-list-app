import React,{useState,useEffect} from 'react';
import axios from 'axios';
import { Box, Paper, Typography, InputBase, Select, MenuItem, Button, TextField, Tooltip, Badge, Alert, Checkbox } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DeleteForever } from '@mui/icons-material';
import { format } from 'date-fns';
import noData from '../assets/noData.png';

const Tasks = () => {
	const [allTasks,setAllTasks] = useState([]);
	const priorityLevels = ['Low','Medium','High'];
	const [alert,setAlert] = useState({type:'',message:'',show:false});
	const [checkedTasks, setCheckedTasks] = useState({});
	const [taskSelected, setTaskSelected] = useState(false);
	const [formValues,setFormValues] = useState({
		newTask:'',
		priority:'Low',
		date: new Date()
	})

	useEffect(()=>{
		const isAnyTaskSelected = Object.values(checkedTasks).some(value => value === true);
		setTaskSelected(isAnyTaskSelected);
		const selectedTaskId = Object.keys(checkedTasks).find(key => checkedTasks[key] === true);
		const chosenTask = allTasks.find(task => task._id === selectedTaskId) || {};

		let dateValue = new Date(); 

		if (chosenTask.date) {
			dateValue = new Date(chosenTask.date);
		}
			setFormValues({
				newTask: chosenTask?.title,
				priority: chosenTask?.priority,
				date: dateValue,
			})
	}, [checkedTasks])
	
	useEffect(()=>{
		axios.get('/api/tasks').then(response =>setAllTasks(response.data));
	},[])

	const handleChange = (taskId) => {
		setCheckedTasks((prev) => ({
			...prev,
			[taskId]: !prev[taskId], // Toggle the checked state of the specific task
		}));
	};

	useEffect(() => {
		if (alert.show) {
			const timer = setTimeout(() => {
				setAlert({ ...alert, show: false });
			}, 3000); 

			return () => clearTimeout(timer);
		}
	}, [alert]);

	const addTask  = ()=>{
		const formattedDate = format(formValues.date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
		axios.post('/api/tasks', {
			title: formValues.newTask,
			completed: false,
			priority: formValues.priority,
			date: formattedDate,
}).then(response=>{
			setAllTasks([...allTasks, response.data]);
			setAlert({ type:'success', message: 'Task added successfully!', show: true });
			setFormValues({
				newTask: '',
				priority: 'Low',
				date: new Date()
			})
		}).catch(err=>{
			setAlert({ type: 'error', message: 'Error!Please try again.', show: true });
		})
	}

	const editTask = () => {
		const selectedTaskId = Object.keys(checkedTasks).find(key => checkedTasks[key] === true);
		const formattedDate = format(formValues.date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
		axios.put(`/api/tasks/${selectedTaskId}`, {
			title: formValues.newTask,
			priority: formValues.priority,
			date: formattedDate,
		}).then(response => {
			setAllTasks(allTasks.map(task =>
				task._id === selectedTaskId ? response.data : task
			));
			setAlert({ type: 'success', message: 'Task updated successfully!', show: true });
			setCheckedTasks({});
			setFormValues({
				newTask: '',
				priority: 'Low',
				date: new Date()
			})
		}).catch(err => {
			setAlert({ type: 'error', message: 'Error updating task! Please try again.', show: true });
		});
	};

	const deleteTask = (id) => {
		axios.delete(`/api/tasks/${id}`).then(() => {
			setAllTasks(allTasks.filter(task => task._id !== id));
			setAlert({ type: 'success', message: 'Task deleted successfully!', show: true });
		}).catch(err => {
			setAlert({ type: 'error', message: 'Error!Please try again.', show: true });
		});
	};

	return (
		<Box className='p-4' sx={{background:'#F9F9F9',width:'600px'}}>
			<Typography variant='h4' className='text-center' sx={{ color:'#3a6186',fontWeight:'700'}}>To-Do List</Typography>
			{
				alert.show && <Alert className='my-2' severity={alert.type}>{alert.message}</Alert>
			}
			<Box className='flex flex-col gap-3 mt-2'>
				<InputBase
					type='text'
					value={formValues.newTask}
					onChange={(e) => setFormValues((prev) => ({ ...prev, newTask:e.target.value}))}
					placeholder="Task Title"
					sx={{ border: '1px solid #ccc',paddingLeft:'5px' }}
				/>
				<Select
					labelId="priority-label"
					value={formValues.priority}
					size='small'
					label="Priority"
					onChange={(e) => setFormValues((prev) => ({ ...prev, priority: e.target.value }))}
				>
					<MenuItem value="Low">Low</MenuItem>
					<MenuItem value="Medium">Medium</MenuItem>
					<MenuItem value="High">High</MenuItem>
				</Select>
				<LocalizationProvider dateAdapter={AdapterDateFns}>
					<DatePicker
						label="Task Date"
						value={formValues.date}
						onChange={(newDate) => setFormValues((prev) => ({ ...prev, date: newDate }))}
						slots={{
							textField: (props) => <TextField size='small' {...props} />
						}}
					/>
				</LocalizationProvider>
				<Box className='flex gap-x-3'>
					<Button variant='contained' onClick={addTask} className='basis-2/4'>Add Task</Button>
					<Button variant='contained' onClick={editTask} className='basis-2/4' disabled={!taskSelected}>Edit Task</Button>
				</Box>
			
			</Box>
			<Box className='text-center font-bold my-3'>ALL TASKS</Box>
			<Box className='flex w-full'>
				<span className='mr-2 font-semibold font-mono'>Priority</span>
				<Box className='flex justify-start items-start w-full gap-x-3'>
					{
						priorityLevels.map((level,index)=>(
							<Box className='flex justify-center items-center gap-x-1' key={index}>
								<Box className={`w-2 h-2 rounded-full`} sx={{ background: `${level === 'Low' ? '#11998e' : level === 'Medium' ? '#f7b733' :'#f85032'}`}}/>
							<Box>{level}</Box>
							</Box>
						))
					}
				</Box>
			</Box>
			<Box className='my-2 overflow-y-scroll h-96'>
				{
					
					allTasks?.map(task => (
					<Badge
						key={task._id}
						badgeContent=''
						overlap="rectangular"
						variant="dot"
						sx={{
							width: '98%', 
							'& .MuiBadge-dot': {
								backgroundColor: task.priority === 'Low' ? '#11998e' : task.priority === 'Medium' ? '#f7b733' : '#f85032',
							},
							 }}
						className='mt-1'
					>
							<Paper className="flex justify-between p-2 gap-2 mb-2 w-full">
							<Box className="flex basis-92 items-center">
									<Checkbox 
										checked={checkedTasks[task._id] || false}
										onChange={() => handleChange(task._id)}
										inputProps={{ 'aria-label': 'controlled'}} 
										/>
								<span className="basis-4/5">{task.title}</span>
								<span className="basis-1/5">{format(task.date, 'dd/MM/yyyy')}</span>
							</Box>
								<Box className="flex items-center basis-8">
								<Tooltip title="Delete Task">
									<DeleteForever sx={{ color:'#B3A492'}} className='cursor-pointer' onClick={() => deleteTask(task._id)}></DeleteForever>
								</Tooltip>
							</Box>
						</Paper>
					</Badge>
				))}
				{
					allTasks.length === 0 &&
					<Box className='flex justify-center items-center w-full h-full flex-col font-bold'>NO TASKS<Box className='w-48 h-48 mt-1'><img src={noData} alt='No tasks' className='h-full w-full'/></Box></Box>
				}
			</Box>
		</Box>
	)
}

export default Tasks