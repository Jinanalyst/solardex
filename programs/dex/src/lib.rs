use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("11111111111111111111111111111111");

#[program]
pub mod dex {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }

    pub fn create_pool(
        ctx: Context<CreatePool>,
        token_a_amount: u64,
        token_b_amount: u64,
    ) -> Result<()> {
        // Transfer initial liquidity
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_token_a.to_account_info(),
                    to: ctx.accounts.pool_token_a.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            token_a_amount,
        )?;

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_token_b.to_account_info(),
                    to: ctx.accounts.pool_token_b.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            token_b_amount,
        )?;

        Ok(())
    }

    pub fn swap(
        ctx: Context<Swap>,
        amount_in: u64,
        minimum_amount_out: u64,
    ) -> Result<()> {
        // Implement swap logic here
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct CreatePool<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_a: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_b: Account<'info, TokenAccount>,
    #[account(mut)]
    pub pool_token_a: Account<'info, TokenAccount>,
    #[account(mut)]
    pub pool_token_b: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_in: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_out: Account<'info, TokenAccount>,
    #[account(mut)]
    pub pool_token_in: Account<'info, TokenAccount>,
    #[account(mut)]
    pub pool_token_out: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}
