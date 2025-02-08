<?php include_once 'include/header.php'  ?>
    <form id="register-form" action="http://localhost:3000/users/new" method="post">
        <h1 class="h3 mb-3 fw-normal">Please register</h1>

        <div class="form-floating">
            <input type="text" class="form-control" id="name" placeholder="Toto">
            <label for="floatingInput">Name</label>
        </div>
        <div class="form-floating">
            <input type="text" class="form-control" id="username" placeholder="Titi">
            <label for="floatingInput">Username</label>
        </div>
        <div class="form-floating">
            <input type="password" class="form-control" id="password" placeholder="Password">
            <label for="floatingPassword">Password</label>
        </div>

        <button class="btn btn-primary w-100 my-3 p-2" type="submit">Sign in</button>
        <p class="mt-5 mb-3 text-body-secondary">© 2017–2025</p>
    </form>

    <script>
        document.getElementById('register-form').addEventListener('submit', function(e){

            let form =
                JSON.stringify({
                    name: document.getElementById('name').value,
                    username: document.getElementById('username').value,
                    password: document.getElementById('password').value
                });
            console.log(form);
            fetch('http://localhost:3000/users/new', {
                method: 'POST',
                body: form
            }).then(function(response){
                return response.json();
            }).then(function(data){
                if (data.status == 'success'){
                    window.location = 'index.php';
                } else {
                    alert(data.message);
                }
            });
        });
    </script>

<?php include_once 'include/footer.php'  ?>