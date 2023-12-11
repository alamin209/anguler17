<?php

    include("phpmailer/class.phpmailer.php");
    
    $name = $_REQUEST['name'];
    $email = $_REQUEST['email'];
    $grade_level = $_REQUEST['grade_level'];
    
    
    $subject = 'New Signup on TeachItPro';
    $Site_admin_email = 'missio@missio.io';
    $Site_name = 'TeachitPro';
    $to_email = 'dr@teachitpro.com';
    //$to_email = 'ekam@networkhandlers.com';

    

    $message = file_get_contents('emailer.html');

    $message = str_replace('{{NAME}}',$name,$message);
    $message = str_replace('{{EMAIL}}',$email,$message);
    $message = str_replace('{{GRADE}}',$grade_level,$message);

    
    $mail = new PHPMailer();
    $mail->IsSMTP(); // telling the class to use SMTP
    $mail->Host       = 'retail.smtp.com'; // SMTP server
    //$mail-> SMTPSecure = false;
    $mail->SMTPSecure = 'tls';
    $mail->SMTPAuth   = true;                  // enable SMTP authentication
    $mail->Port       = '25025';                    
    $mail->Username   = 'missio@missio.io'; // SMTP account username
    $mail->Password   = 'd6aab255';   
    $mail->Subject = $subject;
    $mail->SetFrom($Site_admin_email,$Site_name);
    $mail->MsgHTML($message);
    $mail->AddAddress($to_email);
    $mail->AddBCC('ekam@networkhandlers.com');
    $mail->AddBCC('ria@networkhandlers.com');
    $sent = $mail->Send();
    $mail->ClearAddresses();

    die('sent');

?>