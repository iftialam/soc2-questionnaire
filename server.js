const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.post('/submit', (req, res) => {
    const { businessName, email, responses } = req.body;

    // Calculate category scores
    const securityScore = (responses.q1 + responses.q2 + responses.q3 + responses.q4 + responses.q5) / 5;
    const availabilityScore = (responses.q6 + responses.q7 + responses.q8) / 3;
    const processingScore = (responses.q9 + responses.q10 + responses.q11) / 3;
    const confidentialityScore = (responses.q12 + responses.q13 + responses.q14) / 3;
    const privacyScore = (responses.q15 + responses.q16 + responses.q17 + responses.q18) / 4;
    const categoryScores = [securityScore, availabilityScore, processingScore, confidentialityScore, privacyScore];

    // Determine strengths and gaps
    const strengths = [];
    const gaps = [];
    if (securityScore >= 3) strengths.push('Strong governance and access controls in Security.');
    if (securityScore < 2) gaps.push('Weak security controls, including governance and monitoring.');
    if (availabilityScore >= 3) strengths.push('Robust disaster recovery and availability monitoring.');
    if (availabilityScore < 2) gaps.push('Inadequate disaster recovery and system availability processes.');
    if (processingScore >= 3) strengths.push('Effective data processing and integrity checks.');
    if (processingScore < 2) gaps.push('Lack of robust data input/output validation.');
    if (confidentialityScore >= 3) strengths.push('Strong confidentiality protections for sensitive data.');
    if (confidentialityScore < 2) gaps.push('Insufficient encryption or access controls for confidential data.');
    if (privacyScore >= 3) strengths.push('Mature privacy policies and data subject rights processes.');
    if (privacyScore < 2) gaps.push('Non-compliant privacy practices or lack of consent mechanisms.');

    // Risk Matrix
    const riskMatrix = `
        <table>
            <tr><th>Risk</th><th>Likelihood</th><th>Impact</th><th>Mitigation</th></tr>
            ${gaps.map(gap => {
                const likelihood = categoryScores.some(score => score < 2) ? 'High' : 'Medium';
                const impact = categoryScores.some(score => score < 2) ? 'High' : 'Moderate';
                return `<tr><td>${gap}</td><td>${likelihood}</td><td>${impact}</td><td>Implement controls and training</td></tr>`;
            }).join('')}
        </table>
    `;

    // Generate report HTML
    const reportHtml = `
        <h2>Client Information</h2>
        <p><strong>Business Name:</strong> ${businessName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Submission Date/Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Report Generated:</strong> ${new Date().toLocaleString()}</p>

        <h2>Security Control Posture Overview</h2>
        <p>Your organization's SOC 2 compliance maturity is assessed across Security, Availability, Processing Integrity, Confidentiality, and Privacy. Based on your responses, your overall maturity is ${
            categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length >= 3 ? 'strong' : 
            categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length >= 2 ? 'moderate' : 'needs improvement'
        }, with specific areas of strength and opportunities for enhancement.</p>

        <h2>Key Strengths</h2>
        <ul>${strengths.length ? strengths.map(s => `<li>${s}</li>`).join('') : '<li>None identified</li>'}</ul>

        <h2>Identified Gaps or Risks</h2>
        <ul>${gaps.length ? gaps.map(g => `<li>${g}</li>`).join('') : '<li>None identified</li>'}</ul>

        <h2>Compliance Alignment with SOC 2 TSC</h2>
        <p>Your alignment with SOC 2 Trust Services Criteria is summarized below:</p>
        <ul>
            <li><strong>Security:</strong> Maturity Level ${securityScore.toFixed(1)}/4</li>
            <li><strong>Availability:</strong> Maturity Level ${availabilityScore.toFixed(1)}/4</li>
            <li><strong>Processing Integrity:</strong> Maturity Level ${processingScore.toFixed(1)}/4</li>
            <li><strong>Confidentiality:</strong> Maturity Level ${confidentialityScore.toFixed(1)}/4</li>
            <li><strong>Privacy:</strong> Maturity Level ${privacyScore.toFixed(1)}/4</li>
        </ul>

        <h2>Strategic Recommendations</h2>
        <ul>
            ${gaps.length ? gaps.map(g => `<li>Address ${g.toLowerCase()} by implementing specific controls (e.g., MFA, encryption, DRP testing).</li>`).join('') : '<li>Maintain current controls and pursue continuous improvement.</li>'}
            <li>Conduct a gap analysis and mock audit to prepare for SOC 2 Type I/II.</li>
            <li>Enhance employee training on security and privacy practices.</li>
            <li>Regularly review vendor compliance and update risk assessments.</li>
        </ul>

        <h2>Risk Matrix</h2>
        ${riskMatrix}

        <h2>Summary Conclusion</h2>
        <p>Your SOC 2 compliance posture reflects ${strengths.length ? 'notable strengths in ' + strengths.join(', ') : 'areas needing significant improvement'}. Identified gaps pose risks to data security and regulatory compliance, potentially impacting customer trust and business operations. Prioritizing remediation in low-scoring areas (e.g., ${gaps.length ? gaps.join(', ') : 'none'}) will strengthen your posture. <strong>Next Steps:</strong> Engage a SOC 2 auditor, implement recommended controls, and schedule a follow-up assessment within 3-6 months.</p>
    `;

    res.json({ html: reportHtml, categoryScores });
});

app.listen(port, () => console.log(`Server running on port ${port}`));