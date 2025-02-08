<?php include_once 'include/header.php'  ?>

    <h1>Tasks</h1>

<table class="table table-bordered">
    <thead>
        <tr>
            <th>Task</th>
            <th>Descriprion</th>
            <th>List</th>
            <th>Deadline</th>
            <th>Done</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Task 1</td>
            <td>2</td>
            <td>2</td>
            <td>2</td>
            <td>2</td>
            <td>
                <a href="#" class="btn btn-primary">Edit</a>
                <a href="#" class="btn btn-danger">Delete</a>
            </td>
        </tr>
        <tr>
            <td>Task 2</td>
            <td>2</td>
            <td>2</td>
            <td>2</td>
            <td>2</td>
            <td>
                <a href="#" class="btn btn-primary">Edit</a>
                <a href="#" class="btn btn-danger">Delete</a>
            </td>
        </tr>
        <tr>
            <td>Task 3</td>
            <td>None</td>
            <td>None</td>
            <td>None</td>
            <td>None</td>
            <td>
                <a href="#" class="btn btn-primary">Edit</a>
                <a href="#" class="btn btn-danger">Delete</a>
            </td>
        </tr>
    </tbody>
</table>

<a href="form.php" class="btn btn-primary" data-type="task" data-action="add"">Add a task</a>

<?php include_once 'include/footer.php'  ?>