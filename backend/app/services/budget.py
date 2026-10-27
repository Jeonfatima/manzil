def calculate_budget_summary(total_budget: float, expenses: list) -> dict:
    total_spent = sum(e.amount for e in expenses)
    remaining = total_budget - total_spent
    percentage_used = round((total_spent / total_budget * 100), 1) if total_budget > 0 else 0
    
    categories = {}
    for e in expenses:
        categories[e.category] = categories.get(e.category, 0) + e.amount
        
    return {
        "total_budget": total_budget,
        "total_spent": total_spent,
        "remaining": remaining,
        "percentage_used": percentage_used,
        "is_over_budget": total_spent > total_budget,
        "by_category": categories
    }