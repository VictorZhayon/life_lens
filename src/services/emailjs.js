import emailjs from '@emailjs/browser';

/**
 * Send a review reminder email via EmailJS.
 */
export async function sendReminder(reviewType, email, serviceId, templateId, publicKey) {
  const typeLabels = {
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly'
  };

  const motivationalLines = {
    weekly: "Every week is a fresh canvas. Let's paint wisely. 🎨",
    monthly: "A month of experiences is waiting to be distilled into wisdom. 📖",
    quarterly: "Time to zoom out and see the bigger picture. The view from above changes everything. 🔭"
  };

  const templateParams = {
    to_email: email,
    review_type: typeLabels[reviewType] || reviewType,
    motivational_line: motivationalLines[reviewType] || motivationalLines.weekly,
    app_name: 'LifeLens',
    message: `Your ${typeLabels[reviewType] || reviewType} Review is due today. Take 15-20 minutes to reflect on your 9 life areas and gain AI-powered insights.`
  };

  return emailjs.send(serviceId, templateId, templateParams, publicKey);
}

/**
 * Sample EmailJS template (for documentation):
 *
 * Subject: 🔍 LifeLens — Your {{review_type}} Review is Due!
 *
 * Body:
 * Hi there!
 *
 * {{motivational_line}}
 *
 * {{message}}
 *
 * Open LifeLens and start your review now.
 *
 * — {{app_name}}
 */

export default sendReminder;
