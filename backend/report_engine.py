from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch, mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether
)
from reportlab.graphics.shapes import Drawing, Rect, String
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from io import BytesIO
from datetime import datetime
import uuid

PRIMARY_BLUE = colors.HexColor('#4F46E5')
PRIMARY_DARK = colors.HexColor('#1E1B4B')
ACCENT_CYAN = colors.HexColor('#06B6D4')
ACCENT_GREEN = colors.HexColor('#10B981')
ACCENT_RED = colors.HexColor('#F43F5E')
ACCENT_AMBER = colors.HexColor('#F59E0B')
ACCENT_PURPLE = colors.HexColor('#8B5CF6')
TEXT_DARK = colors.HexColor('#1E293B')
TEXT_MEDIUM = colors.HexColor('#475569')
TEXT_LIGHT = colors.HexColor('#94A3B8')
BORDER_COLOR = colors.HexColor('#E2E8F0')


def generate_credit_report(applicant_data, prediction_result):
    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()

    body_style = ParagraphStyle(
        'BodyCustom',
        parent=styles['Normal'],
        fontSize=10,
        textColor=TEXT_DARK,
        fontName='Helvetica',
        leading=15,
        spaceAfter=4,
    )

    elements = []

    # ── HEADER BANNER ──
    header_table = Table(
        [[Paragraph(
            '<font color="white" size="22"><b>CREDIT RISK ANALYSIS REPORT</b></font>',
            ParagraphStyle('hdr', alignment=TA_CENTER, leading=28),
        )]],
        colWidths=[doc.width],
    )
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), PRIMARY_BLUE),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 20),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(header_table)

    report_id = f"CR-{uuid.uuid4().hex[:8].upper()}"
    timestamp = datetime.now().strftime("%B %d, %Y at %I:%M %p")

    sub_table = Table(
        [[Paragraph(
            f'<font color="#C7D2FE" size="9">{report_id}  |  {timestamp}</font>',
            ParagraphStyle('sub', alignment=TA_CENTER),
        )]],
        colWidths=[doc.width],
    )
    sub_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), PRIMARY_DARK),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(sub_table)
    elements.append(Spacer(1, 20))

    # ── DECISION BADGE ──
    prediction = prediction_result.get('prediction', 'Unknown')
    prob = prediction_result.get('approval_probability', 0)
    certainty = prediction_result.get('certainty_index', 0)

    verdict_color = ACCENT_GREEN if prediction == 'Approved' else ACCENT_RED
    verdict_bg = colors.HexColor('#ECFDF5') if prediction == 'Approved' else colors.HexColor('#FFF1F2')
    verdict_label = 'APPROVED' if prediction == 'Approved' else 'REJECTED'

    if prob > 0.8:
        grade, tier = 'EXCELLENT', 'T1-Premium'
    elif prob > 0.5:
        grade, tier = 'MODERATE', 'T2-Stable'
    else:
        grade, tier = 'CAUTIONARY', 'T3-Review'

    verdict_table = Table([
        [Paragraph(
            f'<font size="28" color="{verdict_color.hexval()}"><b>{verdict_label}</b></font>',
            ParagraphStyle('vdct', alignment=TA_CENTER),
        )],
        [Paragraph(
            f'<font size="10" color="{TEXT_MEDIUM.hexval()}">'
            f'Approval Probability: <b>{prob * 100:.1f}%</b>  |  '
            f'Certainty: <b>{certainty * 100:.1f}%</b>  |  '
            f'Grade: <b>{grade}</b> ({tier})</font>',
            ParagraphStyle('vdctsub', alignment=TA_CENTER),
        )],
    ], colWidths=[doc.width])
    verdict_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), verdict_bg),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (0, 0), 18),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 14),
        ('BOX', (0, 0), (-1, -1), 2, verdict_color),
    ]))
    elements.append(verdict_table)
    elements.append(Spacer(1, 18))

    # ── APPLICANT PROFILE ──
    _add_section_header(elements, 'APPLICANT PROFILE', ACCENT_CYAN)

    profile_rows = [
        ['Age', str(applicant_data.get('Age', 'N/A')),
         'Annual Income', _fmt_currency(applicant_data.get('Income', 0))],
        ['Credit Score', str(applicant_data.get('CreditScore', 'N/A')),
         'Loan Amount', _fmt_currency(applicant_data.get('LoanAmount', 0))],
        ['Experience', f"{applicant_data.get('YearsExperience', 'N/A')} Years",
         'Employment', applicant_data.get('EmploymentType', 'N/A')],
        ['Education', applicant_data.get('Education', 'N/A'),
         'City', applicant_data.get('City', 'N/A')],
    ]

    cw = [doc.width * 0.18, doc.width * 0.32, doc.width * 0.18, doc.width * 0.32]
    profile_table = Table(profile_rows, colWidths=cw)
    profile_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F1F5F9')),
        ('BACKGROUND', (2, 0), (2, -1), colors.HexColor('#F1F5F9')),
        ('TEXTCOLOR', (0, 0), (0, -1), TEXT_MEDIUM),
        ('TEXTCOLOR', (2, 0), (2, -1), TEXT_MEDIUM),
        ('TEXTCOLOR', (1, 0), (1, -1), TEXT_DARK),
        ('TEXTCOLOR', (3, 0), (3, -1), TEXT_DARK),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'),
        ('FONTNAME', (3, 0), (3, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('LINEBELOW', (0, 0), (-1, -2), 0.5, BORDER_COLOR),
        ('LINEBEFORE', (2, 0), (2, -1), 1, BORDER_COLOR),
    ]))
    elements.append(profile_table)
    elements.append(Spacer(1, 18))

    # ── AGENT VOTES ──
    _add_section_header(elements, 'DISTRIBUTED AGENT JURY', ACCENT_PURPLE)

    agent_votes = prediction_result.get('agent_votes', [])
    agent_rows = [['Agent', 'Vote', 'Probability']]
    for v in agent_votes:
        agent_rows.append([
            v.get('name', ''),
            v.get('vote', ''),
            f"{v.get('prob', 0) * 100:.1f}%",
        ])

    agent_table = Table(agent_rows, colWidths=[doc.width * 0.50, doc.width * 0.25, doc.width * 0.25])
    agent_style = [
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT_PURPLE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('LINEBELOW', (0, 0), (-1, -2), 0.5, BORDER_COLOR),
    ]
    for i, v in enumerate(agent_votes, start=1):
        vote_color = ACCENT_GREEN if v.get('vote') == 'Approve' else ACCENT_RED
        agent_style.append(('TEXTCOLOR', (1, i), (1, i), vote_color))
        agent_style.append(('FONTNAME', (1, i), (1, i), 'Helvetica-Bold'))
    agent_table.setStyle(TableStyle(agent_style))
    elements.append(agent_table)
    elements.append(Spacer(1, 18))

    # ── SHAP FEATURE IMPACT ──
    _add_section_header(elements, 'FEATURE IMPACT ANALYSIS (SHAP)', ACCENT_CYAN)

    explanation = prediction_result.get('explanation', {})
    shap_features = explanation.get('features', [])
    sorted_shap = sorted(shap_features, key=lambda x: abs(x.get('impact', 0)), reverse=True)
    max_impact = max((abs(f.get('impact', 0)) for f in sorted_shap), default=1)

    shap_rows = [['Feature', 'Direction', 'SHAP Value']]
    for f in sorted_shap:
        name = f.get('feature', '').replace('_', ' ').title()
        impact = f.get('impact', 0)
        direction = 'Positive' if impact > 0 else 'Negative' if impact < 0 else 'Neutral'
        shap_rows.append([name, direction, f"{impact:+.4f}"])

    shap_table = Table(shap_rows, colWidths=[doc.width * 0.40, doc.width * 0.25, doc.width * 0.35])
    shap_style = [
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT_CYAN),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 7),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('LINEBELOW', (0, 0), (-1, -2), 0.5, BORDER_COLOR),
    ]
    for i, f in enumerate(sorted_shap, start=1):
        impact = f.get('impact', 0)
        row_bg = colors.HexColor('#ECFDF5') if impact > 0 else colors.HexColor('#FFF1F2') if impact < 0 else colors.white
        dir_color = ACCENT_GREEN if impact > 0 else ACCENT_RED if impact < 0 else TEXT_LIGHT
        shap_style.append(('BACKGROUND', (0, i), (-1, i), row_bg))
        shap_style.append(('TEXTCOLOR', (1, i), (1, i), dir_color))
        shap_style.append(('FONTNAME', (1, i), (1, i), 'Helvetica-Bold'))
        val_color = ACCENT_GREEN if impact > 0 else ACCENT_RED if impact < 0 else TEXT_DARK
        shap_style.append(('TEXTCOLOR', (2, i), (2, i), val_color))
        shap_style.append(('FONTNAME', (2, i), (2, i), 'Helvetica-Bold'))
    shap_table.setStyle(TableStyle(shap_style))
    elements.append(shap_table)

    # SHAP visual bars
    elements.append(Spacer(1, 10))
    shap_drawing = _create_shap_bars(sorted_shap, doc.width, max_impact)
    elements.append(shap_drawing)
    elements.append(Spacer(1, 18))

    # ── AI INSIGHTS ──
    _add_section_header(elements, 'AI INSIGHTS & RECOMMENDATIONS', PRIMARY_BLUE)

    ai_insights = prediction_result.get('ai_insights', {})
    summary = ai_insights.get('summary', 'No summary available.')

    summary_table = Table(
        [[Paragraph(
            f'<font size="10" color="{TEXT_DARK.hexval()}"><i>"{summary}"</i></font>',
            ParagraphStyle('sum', leading=14),
        )]],
        colWidths=[doc.width],
    )
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#EFF6FF')),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('LEFTPADDING', (0, 0), (-1, -1), 14),
        ('RIGHTPADDING', (0, 0), (-1, -1), 14),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#BFDBFE')),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 10))

    top_drivers = ai_insights.get('top_drivers', [])
    if top_drivers:
        drivers_text = ', '.join([d.replace('_', ' ').title() for d in top_drivers])
        elements.append(Paragraph(
            f'<font color="{PRIMARY_BLUE.hexval()}"><b>Top Decision Drivers:</b></font> '
            f'<font color="{TEXT_DARK.hexval()}">{drivers_text}</font>',
            body_style,
        ))
        elements.append(Spacer(1, 8))

    mitigation_tips = ai_insights.get('mitigation_tips', [])
    if mitigation_tips:
        elements.append(Paragraph(
            f'<font color="{ACCENT_AMBER.hexval()}"><b>Mitigation Recommendations:</b></font>',
            body_style,
        ))
        for idx, tip in enumerate(mitigation_tips, 1):
            tip_tbl = Table(
                [[
                    Paragraph(
                        f'<font color="{ACCENT_AMBER.hexval()}"><b>{idx}.</b></font>',
                        ParagraphStyle('tn', alignment=TA_RIGHT),
                    ),
                    Paragraph(f'<font size="9" color="{TEXT_DARK.hexval()}">{tip}</font>', body_style),
                ]],
                colWidths=[25, doc.width - 30],
            )
            tip_tbl.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('TOPPADDING', (0, 0), (-1, -1), 2),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            ]))
            elements.append(tip_tbl)
    elements.append(Spacer(1, 18))

    # ── COUNTERFACTUALS ──
    advanced = prediction_result.get('advanced_analytics', {})
    counterfactuals = advanced.get('counterfactuals', [])

    if counterfactuals:
        _add_section_header(elements, 'COUNTERFACTUAL SCENARIOS', ACCENT_AMBER)
        elements.append(Paragraph(
            '<font size="8" color="#64748B"><i>What-if analysis showing changes needed for approval (target: 60% probability)</i></font>',
            ParagraphStyle('cfsub', spaceAfter=6),
        ))

        cf_rows = [['Feature', 'Current Value', 'Target Value', 'Probability Reached']]
        for cf in counterfactuals:
            feat = cf.get('feature', '')
            cf_rows.append([
                feat.replace('_', ' ').title(),
                _fmt_value(feat, cf.get('original', 0)),
                _fmt_value(feat, cf.get('target', 0)),
                f"{cf.get('prob_reached', 0) * 100:.1f}%",
            ])

        cf_table = Table(cf_rows, colWidths=[doc.width * 0.22, doc.width * 0.26, doc.width * 0.26, doc.width * 0.26])
        cf_style = [
            ('BACKGROUND', (0, 0), (-1, 0), ACCENT_AMBER),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
            ('TOPPADDING', (0, 0), (-1, -1), 7),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
            ('LINEBELOW', (0, 0), (-1, -2), 0.5, BORDER_COLOR),
        ]
        for i, cf in enumerate(counterfactuals, start=1):
            prob_r = cf.get('prob_reached', 0)
            clr = ACCENT_GREEN if prob_r >= 0.6 else ACCENT_RED
            cf_style.append(('TEXTCOLOR', (3, i), (3, i), clr))
            cf_style.append(('FONTNAME', (3, i), (3, i), 'Helvetica-Bold'))
        cf_table.setStyle(TableStyle(cf_style))
        elements.append(cf_table)
        elements.append(Spacer(1, 18))

    # ── ROBUSTNESS SCORE ──
    _add_section_header(elements, 'ROBUSTNESS ASSESSMENT', PRIMARY_BLUE)

    robustness = prediction_result.get('robustness_score', 0)
    rob_color = ACCENT_GREEN if robustness >= 70 else ACCENT_AMBER if robustness >= 40 else ACCENT_RED
    rob_label = 'High Stability' if robustness >= 70 else 'Moderate Stability' if robustness >= 40 else 'Low Stability'

    rob_table = Table([
        [
            Paragraph(
                f'<font size="28" color="{rob_color.hexval()}"><b>{robustness:.0f}/100</b></font>',
                ParagraphStyle('robscore', alignment=TA_CENTER),
            ),
            Paragraph(
                f'<font size="11" color="{rob_color.hexval()}"><b>{rob_label}</b></font><br/>'
                f'<font size="8" color="{TEXT_LIGHT.hexval()}">Prediction stability under input perturbation (+/-5%)</font>',
                ParagraphStyle('roblbl', leading=14),
            ),
        ],
    ], colWidths=[doc.width * 0.35, doc.width * 0.65])
    rob_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), colors.HexColor('#F8FAFC')),
        ('ALIGN', (0, 0), (0, 0), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 14),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 14),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
    ]))
    elements.append(rob_table)
    elements.append(Spacer(1, 18))

    # ── SBI SPECIAL ELIGIBILITY ──
    credit_score = applicant_data.get('CreditScore', 0)
    income = applicant_data.get('Income', 0)
    if 300 <= credit_score <= 400 and income >= 300000:
        sbi_table = Table(
            [[Paragraph(
                '<font size="12" color="#F59E0B"><b>SPECIAL ELIGIBILITY: SBI Credit Line</b></font><br/>'
                '<font size="9" color="#475569">Eligible for Special Credit Line up to '
                '<b>\u20b91,00,000</b> under SBI Elite Protocol</font>',
                ParagraphStyle('sbi', leading=16),
            )]],
            colWidths=[doc.width],
        )
        sbi_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FFFBEB')),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('LEFTPADDING', (0, 0), (-1, -1), 14),
            ('BOX', (0, 0), (-1, -1), 2, ACCENT_AMBER),
        ]))
        elements.append(sbi_table)
        elements.append(Spacer(1, 18))

    # ── FOOTER ──
    elements.append(Spacer(1, 20))
    elements.append(HRFlowable(width=doc.width, thickness=1, color=BORDER_COLOR))
    elements.append(Spacer(1, 8))
    elements.append(Paragraph(
        f'<font color="#94A3B8" size="7"><i>Report ID: {report_id}  |  {timestamp}</i></font>',
        ParagraphStyle('footid', alignment=TA_CENTER),
    ))
    elements.append(Paragraph(
        '<font color="#94A3B8" size="7"><i>'
        'DISCLAIMER: This report is generated by an AI-powered credit risk assessment system '
        '(XAI Sentinel v3.0). The predictions and explanations are based on machine learning models '
        'and should be used as a decision-support tool only. Final lending decisions must comply with '
        'applicable regulations and institutional policies. SHAP values represent feature contributions '
        'to the model prediction and should not be interpreted as causal relationships.'
        '</i></font>',
        ParagraphStyle('disclaimer', alignment=TA_CENTER, leading=10),
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer


def _add_section_header(elements, title, color):
    elements.append(KeepTogether([
        Paragraph(
            f'<font color="{color.hexval()}" size="12"><b>{title}</b></font>',
            ParagraphStyle('sec', fontSize=12, spaceBefore=10, spaceAfter=0),
        ),
        HRFlowable(width="100%", thickness=2, color=color, spaceAfter=8),
    ]))


def _fmt_currency(val):
    try:
        return f"\u20b9{float(val):,.0f}"
    except (TypeError, ValueError):
        return str(val)


def _fmt_value(feature, value):
    if feature in ('Income', 'LoanAmount'):
        return _fmt_currency(value)
    if feature == 'CreditScore':
        return f"{int(value)} pts"
    return f"{value:,.1f}"


def _create_shap_bars(sorted_features, width, max_impact):
    n = len(sorted_features)
    bar_h = 16
    gap = 4
    label_w = 110
    bar_area = width - label_w - 90
    total_h = n * (bar_h + gap) + 20

    drawing = Drawing(width, total_h)

    y = total_h - 14
    for f in sorted_features:
        name = f.get('feature', '').replace('_', ' ').title()
        impact = f.get('impact', 0)

        drawing.add(String(0, y - 3, name, fontSize=8, fontName='Helvetica', fillColor=TEXT_MEDIUM))

        bar_w = max(2, (abs(impact) / max_impact) * bar_area) if max_impact > 0 else 2
        bar_color = ACCENT_GREEN if impact > 0 else ACCENT_RED

        drawing.add(Rect(label_w, y - 5, bar_w, bar_h, fillColor=bar_color, strokeColor=None, fillOpacity=0.75))

        drawing.add(String(
            label_w + bar_w + 5, y - 3,
            f"{impact:+.4f}", fontSize=7, fontName='Helvetica-Bold', fillColor=bar_color,
        ))

        y -= (bar_h + gap)

    return drawing
