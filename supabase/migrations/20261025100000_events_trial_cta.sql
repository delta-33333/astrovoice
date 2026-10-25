alter table callastral.events drop constraint if exists events_name_check;
alter table callastral.events add constraint events_name_check check (name = any (array[
  'view_home','view_advisor','select_slot','signup','checkout_start','payment_success','call_started','call_completed',
  'visit','birth_data','slot_selected','checkout_started','paid','summary_bought','call_reengage','call_silence_end',
  'page_view','book_click','signup_view','birth_start','rebook','sample_play','trial_code','trial_verified','ai_bot_hit',
  'cta_click','trial_start','trial_code_sent','trial_call_start'
]));
