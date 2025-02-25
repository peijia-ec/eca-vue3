/**
 * Email templates for Verification Checklist
 */
export const formatEmailBody = (str, replacements) => {
  let body = str
  const placeholders = body.match(/\{(.*?)\}/g)
  placeholders.forEach(function (placeholder) {
    const phText = placeholder.substring(1, placeholder.length - 1);
    const regex = new RegExp(placeholder, 'g');
    body = body.replace(regex, replacements[phText])
  })
  return body
}

export const VERIFICATION_EMAIL_BODY = {
  note: {
    // Email content for no selfie with note
    subject: 'Easy Crypto Verification Selfie',
    body: `Hi {firstName},\n\nThanks for applying to verify with Easy Crypto :)

There was an issue with the photos you used for verification - in your selfie you're <strong>not holding a note as per the instructions.</strong>

Please carefully check our requirements here, <a href="https://help.easycrypto.com/en/articles/6552413-how-do-i-manually-verify">How do I manually verify</a>, and upload photos that match them exactly.

Re-upload your photos here: <a href="{verifyUrl}">Verify</a>`
  },
  noteZA: {
    // Email content for no selfie with note ZA
    subject: 'Easy Crypto Verification Selfie',
    body: `Hi {firstName},

Thanks for applying to verify with Easy Crypto!
    
Unfortunately, we're having trouble verifying your account with our automated verification method.

Can you please head over to the following link and try our manual verification:

{verifyUrl}

Please ensure you carefully read all instructions.`
  },
  foreign: {
    // Email content for foreign users
    body: `Hi {firstName}

Thank you for your application to verify with Easy Crypto.

If you wish to verify using a passport that is not from {country}, we need you to provide us with certified copies of your passport and residence visa - see the instructions here: https://learn.easycrypto.nz/verification-alternatives/

If you email us the certified copies of these documents, we can confirm that they are acceptable, and then we will need to receive these by post.

However, if you have a {country} driver's licence, you can go through our automated verification here: <a href="{verifyUrl}">Verify</a>`
  },
  checklistSelfie: {
    // Email content for selfie issue
    body: `Hi {firstName},
    
Thanks for submitting your application to get verified.

Unfortunately it appears the photos you submitted don\'t meet our requirements, {reason}.

Please carefully read the instructions, <a href="https://help.easycrypto.com/en/articles/6552413-how-do-i-manually-verify">How to verify?</a> and upload photos that match these exactly.

You can re-submit your application with the new photo(s) here: <a href="{verifyUrl}">Verify Easy Crypto</a>`
  },
  unclearID: {
    // Email content for unclearID
    subject: 'Easy Crypto Verification ID not clear',
    body: `Hi {firstName},

Thanks for submitting your application to get verified.

Unfortunately the documents submitted don't meet our requirements - we need to see a <strong>clear closeup of the front of your ID</strong>, we need to be able to clearly read the details & see all four corners in the frame.

Please carefully read the instructions, <a href="https://help.easycrypto.com/en/articles/6552413-how-do-i-manually-verify">How to verify?</a> and upload photos that match these exactly.

You can re-submit your application with the correct documents here: <a href="{verifyUrl}">Verify Easy Crypto</a>

Remember to include a current phone number just in case we need to contact you about your application.`
  },
  noSelfie: {
    // Email content for no selfie with note
    subject: 'Easy Crypto Verification - Note',
    body: `Hi {firstName},

Thanks for submitting your application to get verified.

The photos submitted don't meet our requirements, as you didn't upload <strong>a selfie holding a note and your ID</strong> as per the instructions.

Please carefully read the instructions, <a href="https://help.easycrypto.com/en/articles/6552413-how-do-i-manually-verify">How to verify?</a> and upload photos that match these exactly.

You can re-submit your application with the new photo(s) here: <a href="{verifyUrl}">Verify Easy Crypto</a>`
  },
  underAge: {
    // Email content for under age
    subject: 'Easy Crypto Account Verification Under 18',
    body: `Hi {firstName},

Thanks for submitting your application to get verified with Easy Crypto :)

Your verification wasn't processed as you're under 18 and we need some additional information.

We are more than happy to help you set up an account and if you send in the following things, we can verify your account:

- Your home address.

- A photo of your parent/guardian's ID.

- A photo of the same parent/guardian holding up both their ID and a note stating: 
"I give permission to [your name] to verify and use <a href="https://easycrypto.com/nz">www.easycrypto.nz</a>. I give consent to Easy Crypto to run an ID check on my ID [Today's date]"
Please note that your parent/guardian must be visibly holding their ID and note.
A selfie is fine as long as it includes their full face, and your parent/guardian holding the ID and note.

- A photo of you with ID (such as a Birth certificate).

Just reply to this email, attach those things and we will sort it out!

You may also find information around this following the link below: <a href="https://help.easycrypto.com/en/articles/6552406-under-18-verification-new-zealand">Under 18 Verification</a>`
  },
  expiredID: {
    // Email content for expired ID
    subject: 'Easy Crypto Account Verification Expired ID',
    body: `Hi {firstName},

Thanks for submitting your application to get verified.

Unfortunately it appears that this <strong>ID document has expired</strong>, and we need a current form of ID to complete the <a href="https://help.easycrypto.com/en/articles/6552510-how-can-i-verify-my-account">verification process</a>.

Do you have a current passport or drivers license you can use instead? 

If you do, could you please re-submit your application here with the new valid ID: <a href="{verifyUrl}">Verify</a>

If you don't have any of those, check out our alternative verification options here: <a href="https://help.easycrypto.com/en/articles/6885598-verifying-without-a-passport-or-drivers-license">Verifying without a Passport or Drivers' licence</a>.`
  },
  problemData: {
    // Email content for problematic application data
    subject: 'Easy Crypto Account Verification data',
    body: `Hi {firstName},

Thanks for submitting your application to get verified.

The data you submitted does not meet our <a href="https://help.easycrypto.com/en/articles/6552510-how-can-i-verify-my-account">Account Verification (KYC)</a> requirements.

Please carefully read the instructions and submit details that match these exactly.

You can re-submit your application with the new information here: <a href="{verifyUrl}">Verify</a>`
  },
  problemPhoto: {
    // Email content for problematic application data
    body: `Hi {firstName},

Thanks for submitting your application to get verified.

Unfortunately it appears the photos you submitted don't meet our <a href="https://help.easycrypto.com/en/articles/6552510-how-can-i-verify-my-account">Account Verification (KYC)</a> requirements {reason}.

Please carefully read the instructions and submit photos that match these exactly.

You can re-submit your application with the new photo(s) here: <a href="{verifyUrl}">Verify</a>`
  },
  invalidID: {
    subject: 'Easy Crypto Account Verification ID not valid',
    body: `Hi {firstName},
    
Thanks for submitting your application to get verified.

Unfortunately it appears the information you have provided doesn't meet our <a href="https://help.easycrypto.com/en/articles/6552510-how-can-i-verify-my-account">Account Verification (KYC)</a> requirements as <strong>the ID is not valid</strong>.

Please carefully read the instructions and submit a currently valid ID.

You can re-submit your application with the new information here: <a href="{verifyUrl}">Verify</a>

If you don't have a current valid ID check out this information for other options, <a href="https://help.easycrypto.com/en/articles/6885598-verifying-without-a-passport-or-drivers-license">Verifying without a Passport or Drivers' licence</a>.`
  },
  livelinessCheck: {
    subject: 'Easy Crypto Account Verification liveness',
    // Email content for liveliness check (Sumsub)
    body: `Hi {firstName},

Thanks for submitting your application to get verified.

Unfortunately it appears the information you have provided doesn't meet our <a href="https://help.easycrypto.com/en/articles/6552510-how-can-i-verify-my-account">Account Verification (KYC)</a> requirements as there was <strong>an issue with the liveness check</strong>.
    
Please carefully read the instructions and re-submit your application here: <a href="{verifyUrl}">Verify</a>`
  },
  sumsubAdditionalDoc: {
    // Email content for liveliness check (Sumsub)
    subject: 'Easy Crypto Account Verification Additional Doc',
    body: `Hi {firstName},

Thanks for submitting your application to get verified.

Unfortunately the documents submitted don't meet the <a href="https://help.easycrypto.com/en/articles/6552510-how-can-i-verify-my-account">Account Verification (KYC)</a> requirements as we need to see <strong>a clear closeup of the front of your ID</strong>.

To complete verification please carefully read the instructions and upload photos that match these exactly.

You can re-submit your application with the correct documents here: <a href="{verifyUrl}">Verify</a>`
  },
  general: {
    // Email content for general email for agent
    subject: 'Verification Submission Needs Reviewing',
    body: `Hi {firstName},

Thanks for submitting your application to get verified.

An EC agent has requested a compliance team member looks at the following customer\'s verification. <a href="{verifyUrl}">Verify Easy Crypto</a>`
  },
  additionalDoc: {
    // Email content for additional docs
    body: `Hi {firstName},

Thanks for submitting your application to get verified.

Unfortunately it appears the data you submitted don't meet <a href="https://help.easycryp.to/article/49-verification">our requirements</a> 

Please carefully read the instructions and submit details that match these exactly.

You can re-submit your application with the new photo(s) here: <a href="{verifyUrl}">Verify Easy Crypto</a>`
  },

}
