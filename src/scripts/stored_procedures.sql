use academy_network;

-- Validate the new user's data based on certain rules and if pass, create them.
#Rules:
#email not repeated.
#username not repeated.
#user type available.
#email domain name allowed.

drop procedure if exists sp_user_create;
delimiter $$
create procedure sp_user_create (
	firstname varchar(70),
    lastname varchar(70),
    username varchar(50),
    email varchar(100),
    passwd varchar(300),
    profile_img_src varchar(700),
    description varchar(700),
    user_type_id int unsigned,
    domain_name varchar(255)
)
sp_user_create_label:begin
	declare exist_email int unsigned;
    declare exist_username int unsigned;
    declare exist_user_type int unsigned;
    declare exist_domain int unsigned;
    
    select id into exist_domain from allowed_domains as dom
    where dom.domain_name = domain_name limit 1;
    
    if exist_domain is null then
		select 1 as exit_code,
        "Domain name not allowed" as message;
		leave sp_user_create_label;
    end if;
    
    select id into exist_email from users as u
    where u.email = email limit 1;
    
    if exist_email is not null then
		select 
			2 as exit_code,
            "Email already exists" as message;
		leave sp_user_create_label;
	end if;
    
    select id into exist_username from users as u
    where u.username = username limit 1;
    
    if exist_username is not null then
		select 
			3 as exit_code,
            "Username already exists" as message;
		leave sp_user_create_label;
	end if;
    
    select id into exist_user_type from user_types as ut
    where ut.id = user_type_id limit 1;
    
    if exist_user_type is null then
		select 
			4 as exit_code,
            "This user-type id doesn't exists" as message;
		leave sp_user_create_label;
	end if;
    
	insert into users 
    (firstname, lastname, username, email,
    passwd, profile_img_src, description, user_type_id)
    values 
    (firstname, lastname, username, email,
    passwd, profile_img_src, description, user_type_id);
    
    select
		0 as exit_code,
        last_insert_id() as id,
        "Done" as message;
end $$
delimiter ;
#Create a new student.
drop procedure if exists sp_create_student;
delimiter $$
create procedure sp_create_student (
	user_id int unsigned,
    student_id varchar(50),
    major_id int unsigned
)
sp_create_student_label:begin
	declare exist_user_id int unsigned;
    declare exist_major_id int unsigned;
    declare exist_student int unsigned;
    
    select id into exist_student from students_data as sd
    where sd.user_id = user_id limit 1;
    
    if exist_student is not null then
		select
			1 as exit_code,
            "User already registered as student" as message;
		leave sp_create_student_label;
	end if;
    
    select id into exist_user_id from users as u
    where u.id = user_id limit 1;
    
    if exist_user_id is null then
		select
			2 as exit_code,
            "User doesn't exists" as message;
		leave sp_create_student_label;
	end if;
    
    select id into exist_major_id from majors as m
    where m.id = major_id limit 1;
    
    if exist_major_id is null then
		select
			3 as exit_code,
            "Major doesn't exists" as message;
		leave sp_create_student_label;
	end if; 
    
    insert into students_data (user_id, student_id, major_id)
    values (user_id, student_id, major_id);
    
    select
		0 as exit_code,
        last_insert_id() as id,
        "Done" as message;
end $$
delimiter ;

#Create a new user type if not repeated.
drop procedure if exists sp_user_type_create;
delimiter $$
create procedure sp_user_type_create (
	name varchar(255)
)
sp_user_type_create_label:begin
	declare exist_name int unsigned;
    
    select id into exist_name from user_types as ut
    where ut.name = name limit 1;
    
    if exist_name is not null then
		select
			1 as exit_code,
            "This name already exists" as message;
		leave sp_user_type_create_label;
	end if;
    
    insert into user_types (name)
    values (name);
    
    select
		0 as exit_code,
        last_insert_id() as id,
        "Done" as message;
end $$
delimiter ;

#Create a new allowed domain if isn't repeated.
drop procedure if exists sp_domain_create;
delimiter $$
create procedure sp_domain_create (
	domain_name varchar(255)
)
sp_domain_create_label:begin
	declare exist_domain int unsigned;
    
    select id into exist_domain from allowed_domains as dom
    where dom.domain_name = domain_name limit 1;
    
    if exist_domain is not null then
		select 1 as exit_code,
        "Domain name already exists" as message;
		leave sp_domain_create_label;
    end if;
    
    insert into allowed_domains (domain_name)
    values (domain_name);
    
    select
		0 as exit_code,
        last_insert_id() as id,
        "Done" as message;
end $$
delimiter ;

drop procedure if exists sp_create_api_key;
delimiter $$
create procedure sp_create_api_key (
	appname varchar(100),
    owner_name varchar(100),
    email varchar(100),
    phone varchar(20)
)
sp_create_api_key_label:begin
	declare exist_email int unsigned;
    declare api_key varchar(255);
    
    select id into exist_email from api_keys as ak
    where ak.email = email limit 1;
    
    select sha2(concat(appname, owner_name, email, phone, now()), 256)
    into api_key;
    
    insert into api_keys (appname, api_key, owner_name, email, phone)
    values (appname, api_key, owner_name, email, phone);
    
    select
		0 as exit_code,
        "Done" as message;
end $$
delimiter ;

drop procedure if exists group_permission_create;
delimiter $$
create procedure group_permission_create (
	name varchar(100),
    codename varchar(100)
)
gpc_label:begin
	declare name_exists int;
    declare codename_exists int;
    
    select id into name_exists from group_permissions as gp
    where gp.name = name limit 1;
    if name_exists is not null then
		select
			1 as exist_code,
            "Name already exists.";
		leave gpc_label;
	end if;
    
    select id into codename_exists from group_permissions as gp
    where gp.codename = codename limit 1;
    if codename_exists is not null then
		select
			2 as exist_code,
            "Codename already exists.";
		leave gpc_label;
	end if;
end $$
delimiter ;