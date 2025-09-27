import { http } from '@/shared/api/client';

// Types based on API Gateway documentation
export interface DateRange {
    from_date: string; // YYYY-MM-DD
    to_date: string;   // YYYY-MM-DD
}

export interface Point {
    dt?: string;       // YYYY-MM-DD (for daily/weekly data)
    period?: string;   // YYYY-MM-01 (for monthly data)
    value: number;
}

export interface Series {
    points: Point[];
}

export interface Aggregates {
    sum: Record<string, number>;
    avg: Record<string, number>;
}

export interface KPI {
    collection_rate?: number;
}

export interface Meta {
    group_by: 'day' | 'week' | 'month';
    admin: boolean;
}

// Fines API
export interface FinesRequest {
    range: DateRange;
    group_by?: 'day' | 'week' | 'month';
    public?: boolean;
}

export interface FinesResponse {
    series: {
        violations_delta?: Series;
        rulings_delta?: Series;
        imposed_delta?: Series;    // Admin only
        collected_delta?: Series;  // Admin only
    };
    aggregates: Aggregates;
    kpi?: KPI;  // Admin only
    meta: Meta;
}

// Evacuation API
export interface EvacRequest {
    range: DateRange;
    group_by?: 'day' | 'week' | 'month';
    public?: boolean;
}

export interface EvacResponse {
    series: {
        trucks_on_line?: Series;
        trips?: Series;
        evacuations?: Series;
        impound_income?: Series;  // Admin only
    };
    aggregates: Aggregates;
    meta: Meta;
}

// DTP API
export interface DtpRequest {
    range: DateRange;
}

export interface DtpResponse {
    series: {
        injured_accidents?: Series;
        fatalities?: Series;
        injured_persons?: Series;
    };
    aggregates: Aggregates;
    meta: Meta;
}

// Compare API
export interface CompareRequest {
    metric: string;
    period_a: DateRange;
    period_b: DateRange;
    public?: boolean;
}

export interface PeriodAgg {
    sum: number;
    avg: number;
    count: number;
}

export interface Diff {
    absolute: number;
    relative: number;
}

export interface CompareResponse {
    metric: string;
    period_a: PeriodAgg;
    period_b: PeriodAgg;
    diff: Diff;
    admin: boolean;
}

// Forecast API
export interface ForecastRequest {
    metric: 'injured_accidents' | 'evacuations';
    horizon?: number;
}

export interface ForecastPoint {
    dt?: string;
    period?: string;
    value: number;
    confidence_lower?: number;
    confidence_upper?: number;
}

export interface HistoryPoint {
    dt?: string;
    period?: string;
    value: number;
}

export interface MetaInfo {
    model_name: string;
    model_version: string;
    training_points: number;
    last_training_date: string;
}

export interface ForecastResponse {
    train_range: DateRange;
    freq: 'month' | 'day';
    forecast: ForecastPoint[];
    last_history: HistoryPoint[];
    meta: MetaInfo;
}

export const AnalyticsApi = {
    // Get fines data (POST JSON)
    getFines: (request: FinesRequest) =>
        http.post<FinesResponse>(
            '/api/analitic/fines',
            {
                range: request.range,
                ...(request.group_by ? { group_by: request.group_by } : {}),
            },
            { requireAuth: request.public === false }
        ),

    // Get evacuation data (POST JSON)
    getEvac: (request: EvacRequest) =>
        http.post<EvacResponse>(
            '/api/analitic/evac',
            {
                range: request.range,
                ...(request.group_by ? { group_by: request.group_by } : {}),
            },
            { requireAuth: request.public === false }
        ),

    // Get DTP data
    getDtp: (request: DtpRequest) =>
        http.post<DtpResponse>(
            '/api/analitic/dtp',
            { range: request.range }
        ),

    // Compare periods
    compare: (request: CompareRequest) =>
        http.post<CompareResponse>(
            '/api/analitic/compare',
            {
                metric: request.metric,
                period_a: request.period_a,
                period_b: request.period_b,
            },
            { requireAuth: request.public === false }
        ),

    // Get forecast
    getForecast: (request: ForecastRequest) => {
        const queryParams: Record<string, any> = {
            metric: request.metric
        };
        if (request.horizon) queryParams['horizon'] = request.horizon;

        return http.get<ForecastResponse>('/api/analitic/forecast', {
            query: queryParams
        });
    },
};

// Helper functions for date ranges
export const DateRangeHelpers = {
    getLastYear: (): DateRange => {
        const now = new Date();
        const lastYear = new Date(now.getFullYear() - 1, 0, 1);
        const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31);

        return {
            from_date: lastYear.toISOString().split('T')[0],
            to_date: endOfLastYear.toISOString().split('T')[0],
        };
    },

    getCurrentYear: (): DateRange => {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        return {
            from_date: startOfYear.toISOString().split('T')[0],
            to_date: now.toISOString().split('T')[0],
        };
    },

    getLastMonth: (): DateRange => {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        return {
            from_date: lastMonth.toISOString().split('T')[0],
            to_date: endOfLastMonth.toISOString().split('T')[0],
        };
    },

    getCurrentMonth: (): DateRange => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return {
            from_date: startOfMonth.toISOString().split('T')[0],
            to_date: now.toISOString().split('T')[0],
        };
    },

    getLastWeek: (): DateRange => {
        const now = new Date();
        const lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() - 7);
        const endOfLastWeek = new Date(now);
        endOfLastWeek.setDate(now.getDate() - 1);

        return {
            from_date: lastWeek.toISOString().split('T')[0],
            to_date: endOfLastWeek.toISOString().split('T')[0],
        };
    },

    getCurrentWeek: (): DateRange => {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday

        return {
            from_date: startOfWeek.toISOString().split('T')[0],
            to_date: now.toISOString().split('T')[0],
        };
    },
};
