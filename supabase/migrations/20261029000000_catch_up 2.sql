-- =====================================================================
-- CHII database update - CATCH-UP (29 October 2026)
-- Brings a database that last had update_insight_figures_2026-10-12.sql
-- up to date with the final HEMP workbook, and adds HENT and HECO.
-- It includes everything from these files, so you do NOT need to run
-- them separately:
--   update_countries_world_2026-10-13.sql
--   update_hemp_percent_2026-10-12.sql
--   update_hemp_percent_units_2026-10-28.sql
--   update_add_hent_heco_2026-10-28.sql
--   update_hemp_targets_2026-10-28.sql
--   update_hemp_internship_tables_2026-10-28.sql
-- plus the new SIE 'NPS Score' row.
-- It only ADDS and updates settings. Nothing is deleted, and your
-- numbers stay until the next sync refreshes them. Safe to run again.
-- All or nothing: if anything fails, nothing is changed.
-- Run in Supabase: SQL Editor -> New query -> paste -> Run.
-- =====================================================================
begin;

-- ---------------------------------------------------------------------
-- 1. Countries outside Africa (e.g. China) for the Map
-- ---------------------------------------------------------------------
-- Make sure the 3-letter code column exists (added by react_setup.sql)
alter table countries add column if not exists iso3 char(3) unique;

insert into countries (name, iso2, iso3, in_africa)
select x.name, x.iso2, x.iso3, false
from (values
  ('Afghanistan', 'AF', 'AFG'),
  ('Albania', 'AL', 'ALB'),
  ('American Samoa', 'AS', 'ASM'),
  ('Andorra', 'AD', 'AND'),
  ('Anguilla', 'AI', 'AIA'),
  ('Antarctica', 'AQ', 'ATA'),
  ('Antigua and Barbuda', 'AG', 'ATG'),
  ('Argentina', 'AR', 'ARG'),
  ('Armenia', 'AM', 'ARM'),
  ('Aruba', 'AW', 'ABW'),
  ('Australia', 'AU', 'AUS'),
  ('Austria', 'AT', 'AUT'),
  ('Azerbaijan', 'AZ', 'AZE'),
  ('Bahamas', 'BS', 'BHS'),
  ('Bahrain', 'BH', 'BHR'),
  ('Bangladesh', 'BD', 'BGD'),
  ('Barbados', 'BB', 'BRB'),
  ('Belarus', 'BY', 'BLR'),
  ('Belgium', 'BE', 'BEL'),
  ('Belize', 'BZ', 'BLZ'),
  ('Bermuda', 'BM', 'BMU'),
  ('Bhutan', 'BT', 'BTN'),
  ('Bolivia', 'BO', 'BOL'),
  ('Bosnia and Herzegovina', 'BA', 'BIH'),
  ('Bouvet Island', 'BV', 'BVT'),
  ('Brazil', 'BR', 'BRA'),
  ('British Indian Ocean Territory', 'IO', 'IOT'),
  ('British Virgin Islands', 'VG', 'VGB'),
  ('Brunei', 'BN', 'BRN'),
  ('Bulgaria', 'BG', 'BGR'),
  ('Cambodia', 'KH', 'KHM'),
  ('Canada', 'CA', 'CAN'),
  ('Caribbean Netherlands', 'BQ', 'BES'),
  ('Cayman Islands', 'KY', 'CYM'),
  ('Chile', 'CL', 'CHL'),
  ('China', 'CN', 'CHN'),
  ('Christmas Island', 'CX', 'CXR'),
  ('Cocos (Keeling) Islands', 'CC', 'CCK'),
  ('Colombia', 'CO', 'COL'),
  ('Cook Islands', 'CK', 'COK'),
  ('Costa Rica', 'CR', 'CRI'),
  ('Croatia', 'HR', 'HRV'),
  ('Cuba', 'CU', 'CUB'),
  ('Curaçao', 'CW', 'CUW'),
  ('Cyprus', 'CY', 'CYP'),
  ('Czechia', 'CZ', 'CZE'),
  ('Denmark', 'DK', 'DNK'),
  ('Dominica', 'DM', 'DMA'),
  ('Dominican Republic', 'DO', 'DOM'),
  ('Ecuador', 'EC', 'ECU'),
  ('El Salvador', 'SV', 'SLV'),
  ('Estonia', 'EE', 'EST'),
  ('Falkland Islands', 'FK', 'FLK'),
  ('Faroe Islands', 'FO', 'FRO'),
  ('Fiji', 'FJ', 'FJI'),
  ('Finland', 'FI', 'FIN'),
  ('France', 'FR', 'FRA'),
  ('French Guiana', 'GF', 'GUF'),
  ('French Polynesia', 'PF', 'PYF'),
  ('French Southern Territories', 'TF', 'ATF'),
  ('Georgia', 'GE', 'GEO'),
  ('Germany', 'DE', 'DEU'),
  ('Gibraltar', 'GI', 'GIB'),
  ('Greece', 'GR', 'GRC'),
  ('Greenland', 'GL', 'GRL'),
  ('Grenada', 'GD', 'GRD'),
  ('Guadeloupe', 'GP', 'GLP'),
  ('Guam', 'GU', 'GUM'),
  ('Guatemala', 'GT', 'GTM'),
  ('Guernsey', 'GG', 'GGY'),
  ('Guyana', 'GY', 'GUY'),
  ('Haiti', 'HT', 'HTI'),
  ('Heard Island and McDonald Islands', 'HM', 'HMD'),
  ('Honduras', 'HN', 'HND'),
  ('Hong Kong', 'HK', 'HKG'),
  ('Hungary', 'HU', 'HUN'),
  ('Iceland', 'IS', 'ISL'),
  ('India', 'IN', 'IND'),
  ('Indonesia', 'ID', 'IDN'),
  ('Iran', 'IR', 'IRN'),
  ('Iraq', 'IQ', 'IRQ'),
  ('Ireland', 'IE', 'IRL'),
  ('Isle of Man', 'IM', 'IMN'),
  ('Israel', 'IL', 'ISR'),
  ('Italy', 'IT', 'ITA'),
  ('Jamaica', 'JM', 'JAM'),
  ('Japan', 'JP', 'JPN'),
  ('Jersey', 'JE', 'JEY'),
  ('Jordan', 'JO', 'JOR'),
  ('Kazakhstan', 'KZ', 'KAZ'),
  ('Kiribati', 'KI', 'KIR'),
  ('Kuwait', 'KW', 'KWT'),
  ('Kyrgyzstan', 'KG', 'KGZ'),
  ('Laos', 'LA', 'LAO'),
  ('Latvia', 'LV', 'LVA'),
  ('Lebanon', 'LB', 'LBN'),
  ('Liechtenstein', 'LI', 'LIE'),
  ('Lithuania', 'LT', 'LTU'),
  ('Luxembourg', 'LU', 'LUX'),
  ('Macao', 'MO', 'MAC'),
  ('Malaysia', 'MY', 'MYS'),
  ('Maldives', 'MV', 'MDV'),
  ('Malta', 'MT', 'MLT'),
  ('Marshall Islands', 'MH', 'MHL'),
  ('Martinique', 'MQ', 'MTQ'),
  ('Mayotte', 'YT', 'MYT'),
  ('Mexico', 'MX', 'MEX'),
  ('Micronesia', 'FM', 'FSM'),
  ('Moldova', 'MD', 'MDA'),
  ('Monaco', 'MC', 'MCO'),
  ('Mongolia', 'MN', 'MNG'),
  ('Montenegro', 'ME', 'MNE'),
  ('Montserrat', 'MS', 'MSR'),
  ('Myanmar', 'MM', 'MMR'),
  ('Nauru', 'NR', 'NRU'),
  ('Nepal', 'NP', 'NPL'),
  ('Netherlands', 'NL', 'NLD'),
  ('New Caledonia', 'NC', 'NCL'),
  ('New Zealand', 'NZ', 'NZL'),
  ('Nicaragua', 'NI', 'NIC'),
  ('Niue', 'NU', 'NIU'),
  ('Norfolk Island', 'NF', 'NFK'),
  ('North Korea', 'KP', 'PRK'),
  ('North Macedonia', 'MK', 'MKD'),
  ('Northern Mariana Islands', 'MP', 'MNP'),
  ('Norway', 'NO', 'NOR'),
  ('Oman', 'OM', 'OMN'),
  ('Pakistan', 'PK', 'PAK'),
  ('Palau', 'PW', 'PLW'),
  ('Palestine', 'PS', 'PSE'),
  ('Panama', 'PA', 'PAN'),
  ('Papua New Guinea', 'PG', 'PNG'),
  ('Paraguay', 'PY', 'PRY'),
  ('Peru', 'PE', 'PER'),
  ('Philippines', 'PH', 'PHL'),
  ('Pitcairn', 'PN', 'PCN'),
  ('Poland', 'PL', 'POL'),
  ('Portugal', 'PT', 'PRT'),
  ('Puerto Rico', 'PR', 'PRI'),
  ('Qatar', 'QA', 'QAT'),
  ('Romania', 'RO', 'ROU'),
  ('Russia', 'RU', 'RUS'),
  ('Réunion', 'RE', 'REU'),
  ('Saint Barthélemy', 'BL', 'BLM'),
  ('Saint Helena', 'SH', 'SHN'),
  ('Saint Kitts and Nevis', 'KN', 'KNA'),
  ('Saint Lucia', 'LC', 'LCA'),
  ('Saint Martin', 'MF', 'MAF'),
  ('Saint Pierre and Miquelon', 'PM', 'SPM'),
  ('Saint Vincent and the Grenadines', 'VC', 'VCT'),
  ('Samoa', 'WS', 'WSM'),
  ('San Marino', 'SM', 'SMR'),
  ('Saudi Arabia', 'SA', 'SAU'),
  ('Serbia', 'RS', 'SRB'),
  ('Singapore', 'SG', 'SGP'),
  ('Sint Maarten', 'SX', 'SXM'),
  ('Slovakia', 'SK', 'SVK'),
  ('Slovenia', 'SI', 'SVN'),
  ('Solomon Islands', 'SB', 'SLB'),
  ('South Georgia and the South Sandwich Islands', 'GS', 'SGS'),
  ('South Korea', 'KR', 'KOR'),
  ('Spain', 'ES', 'ESP'),
  ('Sri Lanka', 'LK', 'LKA'),
  ('Suriname', 'SR', 'SUR'),
  ('Svalbard and Jan Mayen', 'SJ', 'SJM'),
  ('Sweden', 'SE', 'SWE'),
  ('Switzerland', 'CH', 'CHE'),
  ('Syria', 'SY', 'SYR'),
  ('Taiwan', 'TW', 'TWN'),
  ('Tajikistan', 'TJ', 'TJK'),
  ('Thailand', 'TH', 'THA'),
  ('Timor-Leste', 'TL', 'TLS'),
  ('Tokelau', 'TK', 'TKL'),
  ('Tonga', 'TO', 'TON'),
  ('Trinidad and Tobago', 'TT', 'TTO'),
  ('Turkmenistan', 'TM', 'TKM'),
  ('Turks and Caicos Islands', 'TC', 'TCA'),
  ('Tuvalu', 'TV', 'TUV'),
  ('Türkiye', 'TR', 'TUR'),
  ('US Minor Outlying Islands', 'UM', 'UMI'),
  ('US Virgin Islands', 'VI', 'VIR'),
  ('Ukraine', 'UA', 'UKR'),
  ('United Arab Emirates', 'AE', 'ARE'),
  ('United Kingdom', 'GB', 'GBR'),
  ('United States', 'US', 'USA'),
  ('Uruguay', 'UY', 'URY'),
  ('Uzbekistan', 'UZ', 'UZB'),
  ('Vanuatu', 'VU', 'VUT'),
  ('Vatican City', 'VA', 'VAT'),
  ('Venezuela', 'VE', 'VEN'),
  ('Vietnam', 'VN', 'VNM'),
  ('Wallis and Futuna', 'WF', 'WLF'),
  ('Western Sahara', 'EH', 'ESH'),
  ('Yemen', 'YE', 'YEM'),
  ('Åland Islands', 'AX', 'ALA')
) as x(name, iso2, iso3)
where not exists (select 1 from countries c where c.name = x.name or c.iso2 = x.iso2);

-- ---------------------------------------------------------------------
-- 2. HEMP 'Female %' and 'Male %' on At a Glance
-- ---------------------------------------------------------------------
insert into metrics (dashboard_id, section, metric_group, name, unit, is_headline, description)
select d.id, 'At a Glance', 'Mission Students Metrics', x.name, 'percent', true, x.descr
from dashboards d
cross join (values
  ('Female %', 'Share of enrolled Mission Students who are female (as typed in the workbook)'),
  ('Male %',   'Share of enrolled Mission Students who are male (as typed in the workbook)')
) as x(name, descr)
where d.code = 'HEMP'
on conflict (dashboard_id, section, metric_group, name) do nothing;

-- ---------------------------------------------------------------------
-- 3. HEMP percentage measures stored as percentages (14.79, not 0.1479)
-- ---------------------------------------------------------------------
update metrics m
set unit = 'percent'
from dashboards d
where d.id = m.dashboard_id
  and d.code = 'HEMP'
  and (
        (m.section = 'At a Glance'  and m.name = 'Inclusion Reach')
     or (m.section = 'Intervention' and m.metric_group = 'Programme Overview - Key Metrics'
                                    and m.name in ('Female Participation', 'Inclusion Reach', 'Employment Conversions'))
     or (m.section = 'Intervention' and m.metric_group = 'Inclusion Reach')
      );

-- ---------------------------------------------------------------------
-- 4. The HENT and HECO dashboards
-- ---------------------------------------------------------------------
-- 1. Names as the workbooks use them
update pillars set name = 'Health Entrepreneurship and Innovation' where code = 'HENT';
update pillars set name = 'Health Ecosystem' where code = 'HECO';
update dashboards set name = 'Health Entrepreneurship and Innovation (HENT) Dashboard' where code = 'HENT';
update dashboards set name = 'Health Ecosystem (HECO) Dashboard' where code = 'HECO';

-- 2. HECO programmes from the HECO workbook. (The Executive workbook still
--    lists CRA Fellowship, Health Expert in Residence and PHC Connect; those
--    stay too, so nothing that uses them breaks.)
insert into interventions (pillar_id, name)
select p.id, x.name
from (values ('Public Sector Fellowship'), ('Student Hackathons'),
             ('Public Health Research'), ('Venture Incubation')) as x(name)
cross join pillars p
where p.code = 'HECO'
on conflict (name) do nothing;

-- HENT metric dictionary (97 metrics, generated from HENT_Dashboard_2026.xlsx)
insert into metrics (dashboard_id, section, metric_group, name, unit, is_headline)
select d.id, x.* from (values
  ('At a Glance', 'Participation Metrics', 'Total Participants', 'count', true),
  ('At a Glance', 'Participation Metrics', 'Female %', 'percent', true),
  ('At a Glance', 'Participation Metrics', 'Male %', 'percent', true),
  ('At a Glance', 'Participation Metrics', 'Non-binary', 'count', true),
  ('At a Glance', 'Participation Metrics', 'Countries Reached', 'count', true),
  ('At a Glance', 'Participation Metrics', 'Ventures Supported', 'count', true),
  ('At a Glance', 'Participation Metrics', 'Ventures Funded', 'count', true),
  ('At a Glance', 'Participation Metrics', 'Total Jobs Created', 'count', true),
  ('At a Glance', 'Participation Metrics', 'Capital Deployed', 'currency_usd', true),
  ('At a Glance', 'Participation Metrics', 'Employment Rate', 'percent', true),
  ('At a Glance', 'Programme Reach', 'Programme Reach', 'count', false),
  ('Overview', 'Programme Overview - Key Metrics', 'Total Participants', 'count', true),
  ('Overview', 'Programme Overview - Key Metrics', 'Pwd-Led Ventures', 'count', true),
  ('Overview', 'Programme Overview - Key Metrics', 'Active Ventures', 'count', true),
  ('Overview', 'Programme Overview - Key Metrics', 'Total Jobs Created', 'count', true),
  ('Overview', 'Programme Overview - Key Metrics', 'Total Funding', 'currency_usd', true),
  ('Overview', 'Programme Overview - Key Metrics', 'Female-led Ventures', 'count', true),
  ('Overview', 'Programme Overview - Key Metrics', 'NPS Score', 'score', true),
  ('Overview', 'Reach & Participation', 'Reach & Participation', 'count', false),
  ('Overview', 'Innovation Funnel', 'Innovation Funnel', 'count', false),
  ('Overview', 'Inclusivity Metrics', 'Inclusivity Metrics', 'count', false),
  ('Overview', 'Funding Trend', 'Funding Trend', 'currency_usd', false),
  ('Overview', 'NPS Distribution', 'NPS Distribution', 'count', false),
  ('Intervention', 'Programme Overview - Key Metrics', 'Total Participants', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Sessions Held', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Female Participation', 'percent', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Completion Rate', 'percent', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Partner Organizations', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Inclusion Reach', 'percent', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Satisfaction Score', 'score', true),
  ('Intervention', 'Attendance By Gender Per Year', 'Attendance By Gender Per Year', 'count', false),
  ('Intervention', 'Attendance By Session', 'Attendance By Session', 'count', false),
  ('Intervention', 'Completion Rate By Session', 'Completion Rate By Session', 'percent', false),
  ('Intervention', 'Age Group Distribution', 'Age Group Distribution', 'count', false),
  ('Intervention', 'Social Inclusion Groups', 'Social Inclusion Groups', 'count', false),
  ('Intervention', 'Geographic Region', 'Geographic Region', 'count', false),
  ('Intervention', 'Programme Overview - Key Metrics', 'Total Fellows', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Female Fellows', 'count', true),
  ('Intervention', 'Female vs Male Fellows By Year', 'Female vs Male Fellows By Year', 'count', false),
  ('Intervention', 'Fellows By Development Stage', 'Fellows By Development Stage', 'count', false),
  ('Intervention', 'Fellows By Age Bracket', 'Fellows By Age Bracket', 'count', false),
  ('Intervention', 'Fellows By Region Of Origin', 'Fellows By Region Of Origin', 'count', false),
  ('Intervention', 'Satisfaction By Criterion', 'Satisfaction By Criterion', 'score', false),
  ('Intervention', 'Programme Overview - Key Metrics', 'Hackathons Conducted', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Projects Submitted', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Ideas to Ventures', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Student vs Alumni Share', 'percent', true),
  ('Intervention', 'Hackathons Conducted Per Year', 'Hackathons Conducted Per Year', 'count', false),
  ('Intervention', 'Participation By Gender', 'Participation By Gender', 'count', false),
  ('Intervention', 'Projects By Category', 'Projects By Category', 'count', false),
  ('Intervention', 'Student vs Alumni Participation', 'Student vs Alumni Participation', 'count', false),
  ('Intervention', 'Lifecycle Conversion Funnel', 'Lifecycle Conversion Funnel', 'count', false),
  ('Intervention', 'Programme Overview - Key Metrics', 'Total Ventures', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Ventures Funded', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Total Jobs Created', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Revenue Generated', 'currency_usd', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Female-led Ventures', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Partnerships Built', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Capital Deployed', 'currency_usd', true),
  ('Intervention', 'Ventures By Stage', 'Ventures By Stage', 'count', false),
  ('Intervention', 'Ventures By Sector', 'Ventures By Sector', 'count', false),
  ('Intervention', 'Ventures By Country', 'Ventures By Country', 'count', false),
  ('Intervention', 'Ventures By Cohort', 'Ventures By Cohort', 'count', false),
  ('Intervention', 'Founder Diversity', 'Founder Diversity', 'count', false),
  ('Intervention', 'Employment Growth', 'Employment Growth', 'count', false),
  ('Intervention', 'Programme Overview - Key Metrics', 'Catalytic Capital', 'currency_usd', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Average Ticket Size', 'currency_usd', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Milestones Delivered', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Female-led Ventures Funded', 'count', true),
  ('Intervention', 'Capital Deployed Per Cohort', 'Capital Deployed Per Cohort', 'currency_usd', false),
  ('Intervention', 'Capital By Sector', 'Capital By Sector', 'currency_usd', false),
  ('Intervention', 'Funding Instrument Mix', 'Funding Instrument Mix', 'currency_usd', false),
  ('Intervention', 'Capital By Milestone', 'Capital By Milestone', 'currency_usd', false),
  ('Intervention', 'Programme Overview - Key Metrics', 'Events Held', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Connections Brokered', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Deals Opened', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Pilot Engagements', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Founder Placements', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Pitching Competitions', 'count', true),
  ('Intervention', 'Connections Brokered Per Year', 'Connections Brokered Per Year', 'count', false),
  ('Intervention', 'Events & Founder Placements Per Year', 'Events & Founder Placements Per Year', 'count', false),
  ('Intervention', 'Relationship Funnel', 'Relationship Funnel', 'count', false),
  ('Intervention', 'Stakeholder Mix', 'Stakeholder Mix', 'count', false),
  ('Intervention', 'Platform Comparison', 'Platform Comparison', 'count', false),
  ('Intervention', 'Programme Overview - Key Metrics', 'Study Trips Held', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Student Participants', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Alumni Participants', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Female Participants', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Male Participants', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Partnerships Established', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Average Rating', 'score', true),
  ('Intervention', 'Participation By Gender Per Year', 'Participation By Gender Per Year', 'count', false),
  ('Intervention', 'Participant Type', 'Participant Type', 'count', false),
  ('Intervention', 'Visits By Country', 'Visits By Country', 'count', false),
  ('Intervention', 'Rating Distribution By Criterion', 'Rating Distribution By Criterion', 'score', false),
  ('Intervention', 'Visit Types & Inclusion', 'Visit Types & Inclusion', 'count', false),
  ('Map', 'Mission Students Metrics', 'Participants by Country', 'count', false)
) as x(section, metric_group, name, unit, is_headline)
cross join dashboards d where d.code = 'HENT'
on conflict (dashboard_id, section, metric_group, name) do nothing;

-- HECO metric dictionary (72 metrics, generated from HECO_Dashboard_2026.xlsx)
insert into metrics (dashboard_id, section, metric_group, name, unit, is_headline)
select d.id, x.* from (values
  ('At a Glance', 'Ecosystem Metrics', 'Total Fellows Enrolled', 'count', true),
  ('At a Glance', 'Ecosystem Metrics', 'Female %', 'percent', true),
  ('At a Glance', 'Ecosystem Metrics', 'Male %', 'percent', true),
  ('At a Glance', 'Ecosystem Metrics', 'Countries Reached', 'count', true),
  ('At a Glance', 'Ecosystem Metrics', 'Ventures Incubated', 'count', true),
  ('At a Glance', 'Ecosystem Metrics', 'Research Studies', 'count', true),
  ('At a Glance', 'Ecosystem Metrics', 'Publications', 'count', true),
  ('At a Glance', 'Ecosystem Metrics', 'Partnerships', 'count', true),
  ('At a Glance', 'Ecosystem Metrics', 'Executive Roles Reached', 'count', true),
  ('At a Glance', 'Ecosystem Metrics', 'Operational Funding', 'currency_usd', true),
  ('At a Glance', 'Pillar Reach', 'Pillar Reach', 'count', false),
  ('Overview', 'Ecosystem Overview - Key Metrics', 'Fellows Enrolled', 'count', true),
  ('Overview', 'Ecosystem Overview - Key Metrics', 'Ventures Incubated', 'count', true),
  ('Overview', 'Ecosystem Overview - Key Metrics', 'Research Studies', 'count', true),
  ('Overview', 'Ecosystem Overview - Key Metrics', 'Publications', 'count', true),
  ('Overview', 'Ecosystem Overview - Key Metrics', 'Partnerships', 'count', true),
  ('Overview', 'Ecosystem Overview - Key Metrics', 'Executive Roles Reached', 'count', true),
  ('Overview', 'Ecosystem Overview - Key Metrics', 'Operational Funding', 'currency_usd', true),
  ('Overview', 'Pillar Activity Per Year', 'Pillar Activity Per Year', 'count', false),
  ('Overview', 'Research-to-Policy Funnel', 'Research-to-Policy Funnel', 'count', false),
  ('Overview', 'Venture Incubation Funnel', 'Venture Incubation Funnel', 'count', false),
  ('Overview', 'Geographic Reach By Country', 'Geographic Reach By Country', 'count', false),
  ('Overview', 'Partner Authorities By Type', 'Partner Authorities By Type', 'count', false),
  ('Intervention', 'Programme Overview - Key Metrics', 'Fellows Enrolled', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Fellows Completed', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Female Fellows', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Partner Authorities', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Executive Roles Reached', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Satisfaction Score', 'score', true),
  ('Intervention', 'Fellowship Growth Per Cohort', 'Fellowship Growth Per Cohort', 'count', false),
  ('Intervention', 'Fellows By Gender Per Year', 'Fellows By Gender Per Year', 'count', false),
  ('Intervention', 'Partner Authorities By Type', 'Partner Authorities By Type', 'count', false),
  ('Intervention', 'Executive Roles Reached', 'Executive Roles Reached', 'count', false),
  ('Intervention', 'Fellow Mentorship Driving Ventures', 'Fellow Mentorship Driving Ventures', 'count', false),
  ('Intervention', 'Programme Overview - Key Metrics', 'Hackathons Held', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Student Participants', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Female Participation', 'percent', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Projects Submitted', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Ventures Formed', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Partner Organisations', 'count', true),
  ('Intervention', 'Hackathons Per Year', 'Hackathons Per Year', 'count', false),
  ('Intervention', 'Participation By Gender', 'Participation By Gender', 'count', false),
  ('Intervention', 'Projects By Category', 'Projects By Category', 'count', false),
  ('Intervention', 'Student Participation By Programme', 'Student Participation By Programme', 'count', false),
  ('Intervention', 'Programme Overview - Key Metrics', 'Research Studies', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Publications', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Research Partnerships', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Policy Briefs Issued', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Policy Adoptions', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Female Researchers', 'count', true),
  ('Intervention', 'Research By Theme', 'Research By Theme', 'count', false),
  ('Intervention', 'Publication Pipeline', 'Publication Pipeline', 'count', false),
  ('Intervention', 'Research-to-Policy Funnel', 'Research-to-Policy Funnel', 'count', false),
  ('Intervention', 'Studies Per Year By Country', 'Studies Per Year By Country', 'count', false),
  ('Intervention', 'Programme Overview - Key Metrics', 'Ventures Incubated', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Ventures Progressed', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Female-led Ventures', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Jobs Created', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Fellows Mentoring', 'count', true),
  ('Intervention', 'Programme Overview - Key Metrics', 'Revenue Generated', 'currency_usd', true),
  ('Intervention', 'Venture Incubation Funnel', 'Venture Incubation Funnel', 'count', false),
  ('Intervention', 'Ventures By Country', 'Ventures By Country', 'count', false),
  ('Intervention', 'Ventures By Sector', 'Ventures By Sector', 'count', false),
  ('Partnerships & Funding', 'Programme Overview - Key Metrics', 'Partnerships', 'count', true),
  ('Partnerships & Funding', 'Programme Overview - Key Metrics', 'Partner Authorities', 'count', true),
  ('Partnerships & Funding', 'Programme Overview - Key Metrics', 'Operational Funding', 'currency_usd', true),
  ('Partnerships & Funding', 'Programme Overview - Key Metrics', 'Funding Sources', 'count', true),
  ('Partnerships & Funding', 'Programme Overview - Key Metrics', 'Cumulative Partners', 'count', true),
  ('Partnerships & Funding', 'Programme Overview - Key Metrics', 'Partnerships by Type', 'count', true),
  ('Partnerships & Funding', 'Partner Authorities By Type', 'Partner Authorities By Type', 'count', false),
  ('Partnerships & Funding', 'Operational Funding By Source', 'Operational Funding By Source', 'currency_usd', false),
  ('Partnerships & Funding', 'Ecosystem Footprint By Country', 'Ecosystem Footprint By Country', 'count', false)
) as x(section, metric_group, name, unit, is_headline)
cross join dashboards d where d.code = 'HECO'
on conflict (dashboard_id, section, metric_group, name) do nothing;

-- 3. Proposed links to the Executive figures (confirmed = false: please review).
--    The Executive keeps its own numbers; v_rollup_check shows whether they agree.
insert into metric_rollups (target_metric_id, source_metric_id, by_intervention, confirmed, notes)
select t.id, s.id, x.by_iv, false, x.notes
from (values
  ('Outreach', 'Participation By Intervention', 'HENT', 'Intervention', 'Programme Overview - Key Metrics', 'Total Participants', true,
     'Masterclasses, Hackathon, Study Trips'),
  ('Outreach', 'Participation By Intervention', 'HENT', 'Intervention', 'Programme Overview - Key Metrics', 'Total Fellows', true,
     'Mentorship: assumed participation = fellows'),
  ('Outreach', 'Participation By Intervention', 'HENT', 'Intervention', 'Programme Overview - Key Metrics', 'Total Ventures', true,
     'Ventures: assumed participation = ventures'),
  ('At a Glance', 'Enterprises', 'HENT', 'Intervention', 'Programme Overview - Key Metrics', 'Total Ventures', false,
     'Executive enterprises = HENT ventures?'),
  ('At a Glance', 'Jobs Created (Total)', 'HENT', 'Overview', 'Programme Overview - Key Metrics', 'Total Jobs Created', false,
     'HENT jobs only; HECO Venture Incubation jobs may also count')
) as x(t_section, t_name, s_dash, s_section, s_group, s_name, by_iv, notes)
join metrics t on t.dashboard_id = (select id from dashboards where code = 'EXEC')
              and t.section = x.t_section and t.name = x.t_name
join metrics s on s.dashboard_id = (select id from dashboards where code = x.s_dash)
              and s.section = x.s_section and s.metric_group = x.s_group and s.name = x.s_name
on conflict (target_metric_id, source_metric_id) do nothing;

-- ---------------------------------------------------------------------
-- 5. HEMP framework targets, and the progress view fix
-- ---------------------------------------------------------------------
insert into metrics (dashboard_id, section, metric_group, name, unit, is_headline, description)
select d.id, x.section, x.grp, x.name, x.unit, true, x.descr
from (values
  -- programme sheets (Internships, SIE, Career Workshops, Exposure Events, Courses)
  ('Intervention', 'Programme Overview - Key Metrics', 'Placement Rate', 'percent', 'Placements divided by applications'),
  ('Intervention', 'Programme Overview - Key Metrics', 'Intern Satisfaction', 'percent', '% of interns rating the internship positively'),
  ('Intervention', 'Programme Overview - Key Metrics', 'More Job Ready', 'percent', '% of interns who say they are more job ready'),
  ('Intervention', 'Programme Overview - Key Metrics', 'Host Satisfaction', 'percent', '% of host organisations satisfied'),
  ('Intervention', 'Programme Overview - Key Metrics', 'Repeat Hosting', 'percent', '% of hosts who take interns again'),
  ('Intervention', 'Programme Overview - Key Metrics', 'Selection Rate', 'percent', 'Selected divided by applicants'),
  ('Intervention', 'Programme Overview - Key Metrics', 'Institutions Represented', 'count', 'Institutions among selected students'),
  ('Intervention', 'Programme Overview - Key Metrics', 'Met Expectations', 'percent', '% who say it met or exceeded expectations'),
  ('Intervention', 'Programme Overview - Key Metrics', 'Would Recommend', 'percent', '% who would recommend it'),
  ('Intervention', 'Programme Overview - Key Metrics', 'Pathway Within 6 Months', 'percent', '% of alumni in an internship, course or job within 6 months'),
  ('Intervention', 'Programme Overview - Key Metrics', 'Selection Parity Ratio', 'score', 'A group''s share of those selected divided by its share of applicants (1.0 = parity)'),
  ('Intervention', 'Programme Overview - Key Metrics', 'Attendance Rate', 'percent', 'Attendees divided by registrants'),
  ('Intervention', 'Programme Overview - Key Metrics', 'Participants per Event', 'count', 'Average participants per event'),
  ('Intervention', 'Programme Overview - Key Metrics', 'Refugee / IDP %', 'percent', '% of participants who are refugees or IDPs'),
  ('Intervention', 'Programme Overview - Key Metrics', 'PWD %', 'percent', '% of participants with a disability'),
  ('Intervention', 'Programme Overview - Key Metrics', 'Completion Rate', 'percent', 'Finished divided by started'),
  -- At a Glance
  ('At a Glance', 'Reach & Participation Metrics', 'Event Registrations', 'count', 'Registrations for workshops, exposure events and webinars, plus new sign-ups, per year'),
  ('At a Glance', 'Reach & Participation Metrics', 'Repeat Engagement', 'percent', '% of participants who join two or more HEMP offerings')
) as x(section, grp, name, unit, descr)
cross join dashboards d
where d.code = 'HEMP'
on conflict (dashboard_id, section, metric_group, name) do nothing;

-- Progress view fix: show every target, even before its actual figure exists
-- (previously a target with no actual yet was hidden from v_progress).
create or replace view v_metric_progress with (security_invoker = true) as
select t.metric_id, t.year, t.period, t.item, t.breakdown, t.segment, t.intervention_id,
       t.country_id, t.organization_id, a.value as actual, t.value as target,
       round(100.0 * a.value / nullif(t.value, 0), 1) as progress_pct
from metric_values t
left join metric_values a
  on  a.value_type = 'actual' and a.metric_id = t.metric_id
  and a.year is not distinct from t.year          and a.period is not distinct from t.period
  and a.item is not distinct from t.item          and a.breakdown is not distinct from t.breakdown
  and a.segment = t.segment                       and a.pillar_id is not distinct from t.pillar_id
  and a.intervention_id is not distinct from t.intervention_id
  and a.program_id is not distinct from t.program_id
  and a.institution_id is not distinct from t.institution_id
  and a.country_id is not distinct from t.country_id
  and a.organization_id is not distinct from t.organization_id
  and a.health_area_id is not distinct from t.health_area_id
where t.value_type = 'target';

-- ---------------------------------------------------------------------
-- 6. Internships: INTERN OUTCOMES table
-- ---------------------------------------------------------------------
insert into metrics (dashboard_id, section, metric_group, name, unit, is_headline, description)
select d.id, 'Intervention', x.grp, x.name, 'percent', true, x.descr
from (values
  ('Intern Outcomes', 'Placement Rate',      'Placements divided by applications'),
  ('Intern Outcomes', 'Completion Rate',     'Interns who finish divided by interns who start'),
  ('Intern Outcomes', 'Intern Satisfaction', '% of interns rating the internship positively'),
  ('Intern Outcomes', 'More Job Ready',      '% of interns who say they are more job ready'),
  ('Host Feedback',   'Host Satisfaction',   '% of host organisations satisfied'),
  ('Host Feedback',   'Repeat Hosting',      '% of hosts who take interns again')
) as x(grp, name, descr)
cross join dashboards d
where d.code = 'HEMP'
on conflict (dashboard_id, section, metric_group, name) do update set is_headline = true;

-- ---------------------------------------------------------------------
-- 7. SIE: NPS Score (new row on the SIE sheet)
-- ---------------------------------------------------------------------
insert into metrics (dashboard_id, section, metric_group, name, unit, is_headline, description)
select d.id, 'Intervention', 'Programme Overview - Key Metrics', 'NPS Score', 'percent', true,
       '% of participants who would recommend the programme'
from dashboards d
where d.code = 'HEMP'
on conflict (dashboard_id, section, metric_group, name) do nothing;

commit;

-- Check: how many measures each dashboard has (EXEC 97, HEMP 84, HENT 97, HECO 72)
select d.code as dashboard, count(m.id) as measures
from dashboards d left join metrics m on m.dashboard_id = d.id
group by d.code, d.id order by d.id;
