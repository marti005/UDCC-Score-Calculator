import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://npuyqvemfszjholmtakx.supabase.co";
const supabaseKey = "sb_publishable_yg6H09Qfn4Q41e-ofDl2Mw_LxAsB7XV"

const supabase = createClient(supabaseUrl, supabaseKey);

export async function getChallenges() {
    const { data: challenges } = await supabase.from('Challenges').select().order('id');
    const { data: dependencies } = await supabase.from('Dependencies').select();

    challenges.forEach((c) => {

        const challengeDependencies = dependencies.filter((d) => c.id === d.target);
        c.sub = challengeDependencies.map((cd) => cd.dependency)
    })

    return challenges;
}

export async function getTiers() {
    const { data } = await supabase.from('Tiers').select().order('sort_order')
    return data;
}