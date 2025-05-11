function startMiniShellContainer(userName) {
    // Generate container name based on username
    const containerName = `mini_shell_u_${userName}`;
    
    // Check if container already exists
    return checkIfContainerExists(containerName)
        .then(containerExists => {
            if (containerExists.running) {
                // Container exists and is running - return success with existing container info
                return {
                    success: true,
                    message: `Container ${containerName} is already running`,
                    data: containerExists.data
                };
            } else if (containerExists.exists) {
                // Container exists but isn't running - try to start it
                return startExistingContainer(containerName);
            } else {
                // Container doesn't exist - create new one
                return createNewContainer(containerName);
            }
        })
        .catch(error => {
            console.error('Error starting mini shell container:', error);
            return {
                success: false,
                message: `Failed to start container: ${error.message}`,
                data: null,
                timestamp: new Date().toISOString()
            };
        });
}

function checkIfContainerExists(containerName) {
    return fetch(`/api/containers/${containerName}/json`)
        .then(response => {
            if (response.ok) {
                return response.json().then(data => ({
                    exists: true,
                    running: data.State.Running,
                    data: data
                }));
            } else if (response.status === 404) {
                return { exists: false, running: false, data: null };
            } else {
                throw new Error(`Error checking container: ${response.statusText}`);
            }
        });
}

function startExistingContainer(containerName) {
    return fetch(`/api/containers/${containerName}/start`, { method: 'POST' })
        .then(response => {
            if (response.ok) {
                return {
                    success: true,
                    message: `Container ${containerName} started successfully`,
                    data: { name: containerName }
                };
            } else {
                throw new Error(`Failed to start container: ${response.statusText}`);
            }
        });
}

function createNewContainer(containerName) {
    return fetch(`/api/containers/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: containerName })
    })
    .then(response => {
        if (response.ok) {
            return response.json().then(data => ({
                success: true,
                message: `Container ${containerName} created successfully`,
                data: data
            }));
        } else {
            throw new Error(`Failed to create container: ${response.statusText}`);
        }
    });
}